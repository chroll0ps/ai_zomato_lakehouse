import platform as _std_platform  # Preload stdlib platform to avoid namespace directory collision
import os
import re
import json
import time
from pathlib import Path
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, List, Dict, Any

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import snowflake.connector
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Paths and Environment Configuration (Read-Only from ../ai)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
AI_DIR = PROJECT_ROOT / "ai"
ENV_PATH = AI_DIR / ".env"
CACHE_FILE = AI_DIR / "review_embeddings.parquet"

load_dotenv(dotenv_path=ENV_PATH, override=True)

MODEL = "qwen/qwen3.8-27b"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
TOP_K = 5

FORBIDDEN_WORDS = [
    "drop", "delete", "truncate", "alter", "update",
    "insert", "create", "replace", "grant", "revoke",
]

SCHEMA = """
Tables available (Snowflake). Use bare table names, no database or schema prefix.

FCT_ORDERS(order_id, order_date, customer_id, restaurant_id, city, cuisine,
           payment_method, order_status, is_delivered, sales_amount, discount,
           delivery_fee, gst, customer_rating, delivery_time_min)
DIM_RESTAURANTS(restaurant_id, restaurant_name, city, cuisine, rating, cost_for_two)
DIM_CUSTOMER(customer_id, customer_name, age, age_segment, gender, city)
MART_DAILY_CITY_REVENUNE(order_date, city, orders, cancel_rate, gmv, aov)
MART_RESTAURANT_PERFORMANCE(restaurant_id, restaurant_name, city, cuisine,
                            orders, revenue, avg_customer_rating, cancel_rate)
MART_DELIVERY_SLA(city, order_hour, delivered_orders, p50_delivery_min, late_rate)

Note: gmv means delivered revenue. Prefer the MART_ tables when they fit the question.
Note: The daily city revenue table is named MART_DAILY_CITY_REVENUNE.
"""

SYSTEM_PROMPT_SQL = f"""
You are a Snowflake SQL expert. Write ONE SELECT query that answers the question.

Rules:
- SELECT queries only, never modify data.
- Use bare table names (FCT_ORDERS, not ZOMATO.MARTS.FCT_ORDERS).
- The daily city revenue table is named MART_DAILY_CITY_REVENUNE.
- The restaurants dimension table is named DIM_RESTAURANTS.
- When grouping by city or category, always use aggregate functions like SUM(gmv), COUNT(order_id), AVG(p50_delivery_min). In MART_DAILY_CITY_REVENUNE, each row is daily, so use SUM(gmv) when aggregating by city.
- Add a LIMIT of 100 or less, unless the question asks for a single total.
- Reply as JSON in this exact format: {{"sql": "your query here"}}

{SCHEMA}
"""

SYSTEM_PROMPT_RAG = (
    "Answer ONLY using the customer reviews provided. "
    "Be concise. If the reviews don't cover it, say so."
)

# ---------------------------------------------------------------------------
# Global Clients & Singletons
# ---------------------------------------------------------------------------
groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

_embedder: Optional[SentenceTransformer] = None
_reviews_df: Optional[pd.DataFrame] = None


def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedder


def get_reviews_df() -> pd.DataFrame:
    global _reviews_df
    if _reviews_df is None:
        if not CACHE_FILE.exists():
            raise RuntimeError(f"Cached reviews embeddings not found at {CACHE_FILE}")
        _reviews_df = pd.read_parquet(CACHE_FILE)
    return _reviews_df


def get_snowflake_connection():
    return snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE", "ZOMATO_WH"),
        database=os.getenv("SNOWFLAKE_DATABASE", "ZOMATO"),
        schema="MARTS",
        role="DBT_ROLE",
    )


# ---------------------------------------------------------------------------
# Helper Utilities
# ---------------------------------------------------------------------------
def strip_think(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def sanitize_value(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, (Decimal, np.floating)):
        f = float(v)
        return None if (np.isnan(f) or np.isinf(f)) else f
    if isinstance(v, (np.integer, int)):
        return int(v)
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, float):
        return None if (np.isnan(v) or np.isinf(v)) else v
    if pd.isna(v):
        return None
    return v


def detect_city_in_text(text: str, available_cities: List[str]) -> Optional[str]:
    lower = text.lower()
    for city in available_cities:
        if city.lower() in lower:
            return city
    return None


def is_safe_sql(sql: str) -> bool:
    lowered = sql.lower().strip()
    if not (lowered.startswith("select") or lowered.startswith("with")):
        return False

    # Block multiple statements with semicolons
    cleaned_trailing = lowered.rstrip(";").strip()
    if ";" in cleaned_trailing:
        return False

    # Check forbidden DDL/DML keywords with whole-word boundaries
    for word in FORBIDDEN_WORDS:
        if re.search(rf"\b{word}\b", lowered):
            return False

    return True


def normalize_sql_query(sql: str) -> str:
    cleaned = sql.replace("ZOMATO.MARTS.", "").replace("MARTS.", "").replace("ZOMATO.", "")
    # Resilience aliases: ensure MART_DAILY_CITY_REVENUE -> MART_DAILY_CITY_REVENUNE
    cleaned = re.sub(r"\bMART_DAILY_CITY_REVENUE\b", "MART_DAILY_CITY_REVENUNE", cleaned, flags=re.IGNORECASE)
    # Ensure DIM_RESTAURANT -> DIM_RESTAURANTS
    cleaned = re.sub(r"\bDIM_RESTAURANT\b", "DIM_RESTAURANTS", cleaned, flags=re.IGNORECASE)
    return cleaned.strip().rstrip(";")


# ---------------------------------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Zomato AI Flagship Platform API",
    description="Thin, resilient FastAPI bridge connecting Snowflake MARTS & local reviews RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request & Response Schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    question: str
    mode: str = "auto"  # "auto" | "rag" | "sql"
    city: Optional[str] = None


class ReviewSource(BaseModel):
    city: str
    rating: int
    comment: str
    score: float


class SqlResultPayload(BaseModel):
    sql: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    can_chart: bool
    chart_title: Optional[str] = None
    value_suffix: Optional[str] = ""


class ChatResponse(BaseModel):
    mode_used: str  # "rag" | "sql" | "dual"
    answer: str
    sql_result: Optional[SqlResultPayload] = None
    sources: List[ReviewSource] = []
    latency_ms: int


# ---------------------------------------------------------------------------
# Core Logic: RAG Execution
# ---------------------------------------------------------------------------
def execute_rag(question: str, city_filter: Optional[str] = None) -> tuple[str, List[ReviewSource]]:
    df = get_reviews_df()
    embedder = get_embedder()

    # Determine city scope
    all_cities = [c for c in df["city"].dropna().unique().tolist() if c]
    target_city = city_filter if (city_filter and city_filter != "All Cities") else detect_city_in_text(question, all_cities)

    pool = df
    if target_city:
        filtered = df[df["city"].str.lower() == target_city.lower()]
        if not filtered.empty:
            pool = filtered

    # Encode question
    question_vec = embedder.encode([question], normalize_embeddings=True)[0]

    # Compute cosine similarity
    embeddings_matrix = np.vstack(pool["embedding"].values)
    # If normalized, cosine similarity is simply the matrix-vector dot product
    scores = np.dot(embeddings_matrix, question_vec)

    scored_df = pool.copy()
    scored_df["score"] = scores
    top_reviews = scored_df.nlargest(TOP_K, "score")

    context = ""
    sources: List[ReviewSource] = []
    for _, row in top_reviews.iterrows():
        context += f"- ({row['city']}, {row['rating']} stars) {row['comment']}\n"
        sources.append(
            ReviewSource(
                city=str(row["city"]),
                rating=int(row["rating"]),
                comment=str(row["comment"]),
                score=round(float(row["score"]), 3),
            )
        )

    user_prompt = f"Question: {question}\n\nReviews:\n{context}"
    response = groq_client.chat.completions.create(
        model=MODEL,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_RAG},
            {"role": "user", "content": user_prompt},
        ],
    )
    raw_answer = response.choices[0].message.content or ""
    answer = strip_think(raw_answer)
    return answer, sources


# ---------------------------------------------------------------------------
# Core Logic: SQL Execution
# ---------------------------------------------------------------------------
def execute_sql(question: str, city_filter: Optional[str] = None) -> tuple[str, SqlResultPayload]:
    # Augment prompt if city filter is explicitly active
    scoped_question = question
    if city_filter and city_filter != "All Cities" and city_filter.lower() not in question.lower():
        scoped_question = f"{question} (scoped specifically to city: {city_filter})"

    # 1. Ask Groq to generate SQL
    try:
        response = groq_client.chat.completions.create(
            model=MODEL,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_SQL},
                {"role": "user", "content": scoped_question},
            ],
        )
        raw_content = response.choices[0].message.content or "{}"
        clean_content = strip_think(raw_content)
        parsed = json.loads(clean_content)
        raw_sql = parsed.get("sql", "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SQL from Groq: {str(e)}")

    sql = normalize_sql_query(raw_sql)
    if not is_safe_sql(sql):
        raise HTTPException(
            status_code=400,
            detail="The generated SQL was flagged as unsafe or contains prohibited statements.",
        )

    # 2. Run query on Snowflake MARTS
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        df = cursor.execute(sql).fetch_pandas_all()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Snowflake query execution error: {str(e)}")

    columns = [str(c).lower() for c in df.columns]
    df.columns = columns

    # Determine if chartable (2 columns with 2nd numeric)
    can_chart = False
    if len(columns) == 2 and not df.empty:
        val_series = df.iloc[:, 1]
        can_chart = pd.api.types.is_numeric_dtype(val_series) or all(
            isinstance(v, (int, float, Decimal)) for v in val_series.dropna().head(5)
        )

    # Safely serialize rows
    rows_data: List[Dict[str, Any]] = []
    for record in df.to_dict(orient="records"):
        clean_row = {col: sanitize_value(val) for col, val in record.items()}
        rows_data.append(clean_row)

    # 3. Generate concise synthesis of SQL results
    chart_title = None
    value_suffix = ""
    if can_chart:
        chart_title = f"{columns[1].replace('_', ' ').title()} by {columns[0].replace('_', ' ').title()}"
        if "rate" in columns[1] or "pct" in columns[1]:
            value_suffix = "%"

    # Quick natural language summary of the returned rows
    summary_preview = rows_data[:5]
    summary_prompt = (
        f"You are an analytics assistant. In 1 to 2 concise sentences, summarize this Snowflake query result for the question '{question}':\n"
        f"Columns: {columns}\n"
        f"Top Rows: {json.dumps(summary_preview)}\n"
        f"Total Rows: {len(rows_data)}"
    )
    try:
        sum_resp = groq_client.chat.completions.create(
            model=MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": "Be concise, direct, and factual. Quote exact metrics from the rows."},
                {"role": "user", "content": summary_prompt},
            ],
        )
        answer = strip_think(sum_resp.choices[0].message.content or "")
    except Exception:
        answer = f"Retrieved {len(rows_data)} rows from Snowflake MARTS."

    sql_payload = SqlResultPayload(
        sql=sql,
        columns=columns,
        rows=rows_data,
        row_count=len(rows_data),
        can_chart=can_chart,
        chart_title=chart_title,
        value_suffix=value_suffix,
    )

    return answer, sql_payload


# ---------------------------------------------------------------------------
# Routing Logic: Auto Classifier
# ---------------------------------------------------------------------------
def classify_intent(question: str) -> str:
    lower = question.lower()
    sql_keywords = [
        "gmv", "revenue", "order", "sales", "cancel", "rate", "sla", "delivery time",
        "average", "avg", "top ", "worst", "count", "metric", "ranking", "aov", "cuisine",
        "payment", "delivered", "discount", "fee", "cost"
    ]
    rag_keywords = [
        "complain", "review", "praise", "packaging", "rude", "feedback", "why are",
        "customer", "taste", "quality", "leaked", "leak", "cold", "experience", "sentiment",
        "partner", "driver", "etiquette", "attitude"
    ]

    wants_sql = any(k in lower for k in sql_keywords)
    wants_rag = any(k in lower for k in rag_keywords)

    if wants_sql and wants_rag:
        return "dual"
    if wants_sql:
        return "sql"
    return "rag"


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def get_health():
    df = get_reviews_df()
    return {
        "status": "ok",
        "model": MODEL,
        "total_reviews": len(df),
        "snowflake_configured": bool(os.getenv("SNOWFLAKE_ACCOUNT")),
    }


@app.get("/api/metadata")
def get_metadata():
    df = get_reviews_df()
    cities = sorted([c for c in df["city"].dropna().unique().tolist() if c])
    return {
        "cities": ["All Cities"] + cities,
        "model": MODEL,
        "total_reviews": len(df),
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    start_time = time.time()
    mode = req.mode.lower().strip()

    if mode not in ["auto", "rag", "sql"]:
        mode = "auto"

    effective_mode = classify_intent(req.question) if mode == "auto" else mode

    answer = ""
    sql_payload: Optional[SqlResultPayload] = None
    sources: List[ReviewSource] = []

    if effective_mode == "dual":
        # Run both SQL and RAG
        sql_ans, sql_payload = execute_sql(req.question, req.city)
        rag_ans, sources = execute_rag(req.question, req.city)
        answer = f"{sql_ans}\n\n{rag_ans}"
        mode_used = "dual"
    elif effective_mode == "sql":
        sql_ans, sql_payload = execute_sql(req.question, req.city)
        answer = sql_ans
        mode_used = "sql"
    else:
        rag_ans, sources = execute_rag(req.question, req.city)
        answer = rag_ans
        mode_used = "rag"

    latency_ms = max(50, int((time.time() - start_time) * 1000))

    return ChatResponse(
        mode_used=mode_used,
        answer=answer,
        sql_result=sql_payload,
        sources=sources,
        latency_ms=latency_ms,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("platform.api:app", host="0.0.0.0", port=8000, reload=False)
