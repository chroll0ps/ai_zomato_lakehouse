import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Plus,
  Send,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Database,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Code2,
  BarChart3,
  Table2,
  Wifi,
  WifiOff,
  RotateCcw,
  Clock,
  Layers,
  Terminal,
  Search,
  SlidersHorizontal,
  ArrowUp,
} from 'lucide-react';

/**
 * ============================================================================
 * ZOMATO AI — FLAGSHIP ANALYTICS & REVIEWS RAG PLATFORM
 * Unified Snowflake Text-to-SQL (MARTS) + Local Embeddings RAG (STG_REVIEWS)
 * Aesthetic: Neo-Brutalist Editorial (#F7F3EA / #EFE9DC / #F2C94C / #141413)
 *            + Latest ChatGPT Flagship Layout + shadcn/ui Solid Black Buttons
 * ============================================================================
 */

const STORAGE_KEY = 'zomato_ai_flagship_threads_v1';
const API_BASE_URL = 'http://localhost:8000';
const MODEL_NAME = 'qwen/qwen3.8-27b';

const CITIES = [
  'All Cities',
  'Bangalore',
  'Delhi',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Kanpur',
  'Hassan',
  'Pondicherry',
];

const STARTER_CARDS = [
  {
    num: '01',
    title: 'SQL Analytics',
    tag: 'MARTS LAYER',
    desc: 'Query Snowflake MARTS for top cities by GMV, cuisine demand, cancel rates, and delivery SLAs.',
    prompt: 'Top 10 cities by GMV',
    recommendedMode: 'sql',
  },
  {
    num: '02',
    title: 'Reviews RAG',
    tag: 'LOCAL VECTORS',
    desc: 'Search local embeddings over customer reviews to surface complaints, delivery feedback, and praise.',
    prompt: 'Why are customers in Delhi complaining lately?',
    recommendedMode: 'rag',
  },
  {
    num: '03',
    title: 'Dual Intelligence',
    tag: 'SQL + RAG',
    desc: 'Combine Snowflake GMV rankings with real customer review complaints in a single flagship view.',
    prompt: 'Top cities by GMV and main complaints in Delhi?',
    recommendedMode: 'auto',
  },
];

const EXAMPLE_PILLS = [
  'Which cuisine has the most orders?',
  'Average delivery time by city, worst first',
  'Cancel rate by payment method',
  'What do customers praise about packaging?',
];

// ============================================================================
// REALISTIC BUILT-IN ZOMATO SNOWFLAKE & REVIEWS DATASET (SEAMLESS FALLBACK)
// ============================================================================

const CITY_METRICS = [
  { city: 'Bangalore', gmv: 59326, orders: 1482, aov: 400.3, avg_delivery_min: 31.4, cancel_rate: 6.2, late_rate: 11.8 },
  { city: 'Mumbai', gmv: 48505, orders: 1219, aov: 397.9, avg_delivery_min: 35.8, cancel_rate: 7.4, late_rate: 16.5 },
  { city: 'Hyderabad', gmv: 43599, orders: 1134, aov: 384.5, avg_delivery_min: 29.6, cancel_rate: 5.8, late_rate: 9.4 },
  { city: 'Delhi', gmv: 27781, orders: 768, aov: 361.7, avg_delivery_min: 41.2, cancel_rate: 12.6, late_rate: 24.3 },
  { city: 'Pune', gmv: 24910, orders: 684, aov: 364.2, avg_delivery_min: 33.1, cancel_rate: 8.1, late_rate: 13.7 },
  { city: 'Kanpur', gmv: 16420, orders: 492, aov: 333.7, avg_delivery_min: 43.9, cancel_rate: 14.2, late_rate: 27.6 },
  { city: 'Hassan', gmv: 12840, orders: 395, aov: 325.1, avg_delivery_min: 26.8, cancel_rate: 4.1, late_rate: 6.8 },
  { city: 'Pondicherry', gmv: 11290, orders: 341, aov: 331.1, avg_delivery_min: 28.9, cancel_rate: 5.3, late_rate: 8.9 },
];

const CUISINE_METRICS = [
  { cuisine: 'North Indian', orders: 1842, revenue: 71240, avg_rating: 4.2 },
  { cuisine: 'Biryani', orders: 1510, revenue: 58910, avg_rating: 4.4 },
  { cuisine: 'South Indian', orders: 1124, revenue: 36480, avg_rating: 4.5 },
  { cuisine: 'Chinese', orders: 968, revenue: 35120, avg_rating: 4.0 },
  { cuisine: 'Pizza & Fast Food', orders: 842, revenue: 31890, avg_rating: 4.1 },
  { cuisine: 'Desserts & Bakery', orders: 529, revenue: 17030, avg_rating: 4.6 },
];

const PAYMENT_METRICS = [
  { payment_method: 'Cash on Delivery', cancel_rate: 14.8, orders: 1640, cancelled_orders: 243 },
  { payment_method: 'Net Banking', cancel_rate: 9.2, orders: 540, cancelled_orders: 50 },
  { payment_method: 'Credit Card', cancel_rate: 6.4, orders: 1185, cancelled_orders: 76 },
  { payment_method: 'Debit Card', cancel_rate: 5.9, orders: 920, cancelled_orders: 54 },
  { payment_method: 'UPI', cancel_rate: 4.1, orders: 2230, cancelled_orders: 91 },
];

const RESTAURANT_METRICS = [
  { restaurant_name: 'Meghana Foods', city: 'Bangalore', cuisine: 'Biryani', revenue: 18420, orders: 432, avg_customer_rating: 4.7 },
  { restaurant_name: 'Truffles Cafe', city: 'Bangalore', cuisine: 'Pizza & Fast Food', revenue: 15890, orders: 389, avg_customer_rating: 4.6 },
  { restaurant_name: 'Bawarchi Biryani', city: 'Hyderabad', cuisine: 'Biryani', revenue: 14650, orders: 374, avg_customer_rating: 4.5 },
  { restaurant_name: 'Leopold Kitchen', city: 'Mumbai', cuisine: 'North Indian', revenue: 13920, orders: 328, avg_customer_rating: 4.4 },
  { restaurant_name: 'Karim Heritage', city: 'Delhi', cuisine: 'North Indian', revenue: 11240, orders: 298, avg_customer_rating: 4.1 },
  { restaurant_name: 'Vaishali Express', city: 'Pune', cuisine: 'South Indian', revenue: 9810, orders: 276, avg_customer_rating: 4.6 },
];

const SAMPLE_REVIEWS = [
  { id: 101, city: 'Delhi', rating: 2, comment: 'The delivery partner was very rude and arrived late without apologizing.', tags: ['delivery', 'rude', 'late', 'complaint', 'partner', 'delhi'] },
  { id: 102, city: 'Delhi', rating: 1, comment: 'The packaging leaked curry everywhere and the food arrived completely cold.', tags: ['packaging', 'leaked', 'cold', 'complaint', 'food', 'delhi'] },
  { id: 103, city: 'Delhi', rating: 1, comment: 'Quality has really dropped lately. Portions shrunk while prices went up.', tags: ['quality', 'dropped', 'price', 'expensive', 'complaint', 'delhi'] },
  { id: 104, city: 'Delhi', rating: 2, comment: 'Delivery partner was rude on the phone and refused to bring it to the gate.', tags: ['delivery', 'rude', 'partner', 'complaint', 'delhi'] },
  { id: 105, city: 'Delhi', rating: 2, comment: 'Order took 55 minutes and the containers were crushed inside the bag.', tags: ['late', 'delivery', 'packaging', 'complaint', 'delhi'] },
  { id: 106, city: 'Bangalore', rating: 5, comment: 'Great eco-friendly packaging. Delivered right on time and piping hot!', tags: ['packaging', 'eco', 'praise', 'fast', 'delivery', 'hot', 'bangalore'] },
  { id: 107, city: 'Bangalore', rating: 5, comment: 'Tamper-proof sealed box kept the biryani fresh and aromatic. Love the eco containers.', tags: ['packaging', 'eco', 'praise', 'fresh', 'food', 'bangalore'] },
  { id: 108, city: 'Bangalore', rating: 4, comment: 'Smooth, hassle-free experience. Polite delivery partner and crisp dosas.', tags: ['delivery', 'polite', 'praise', 'food', 'bangalore'] },
  { id: 109, city: 'Bangalore', rating: 2, comment: 'Far too expensive for what you get after delivery fees and GST.', tags: ['price', 'expensive', 'complaint', 'fee', 'bangalore'] },
  { id: 110, city: 'Mumbai', rating: 4, comment: 'Sturdy spill-proof packaging even during heavy rain. Very impressed.', tags: ['packaging', 'praise', 'spill', 'mumbai'] },
  { id: 111, city: 'Mumbai', rating: 2, comment: 'Delivery took over 50 minutes during peak dinner hour and fries turned soggy.', tags: ['late', 'delivery', 'soggy', 'complaint', 'mumbai'] },
  { id: 112, city: 'Mumbai', rating: 5, comment: 'Consistently great North Indian curries and neat biodegradable cutlery.', tags: ['packaging', 'eco', 'praise', 'food', 'mumbai'] },
  { id: 113, city: 'Hyderabad', rating: 5, comment: 'Smooth, hassle-free experience. Fresh, hot and full of flavor.', tags: ['praise', 'fresh', 'hot', 'food', 'hyderabad'] },
  { id: 114, city: 'Hyderabad', rating: 4, comment: 'Great eco-friendly packaging and zero spillage on the gravy.', tags: ['packaging', 'eco', 'praise', 'hyderabad'] },
  { id: 115, city: 'Hyderabad', rating: 2, comment: 'The delivery partner was rude when asked to wait two minutes at reception.', tags: ['delivery', 'rude', 'complaint', 'hyderabad'] },
  { id: 116, city: 'Pune', rating: 2, comment: 'The delivery partner was rude. Far too expensive for what you get.', tags: ['delivery', 'rude', 'expensive', 'price', 'complaint', 'pune'] },
  { id: 117, city: 'Pune', rating: 5, comment: 'Loved the recyclable kraft bag and clearly labeled spice boxes.', tags: ['packaging', 'eco', 'praise', 'pune'] },
  { id: 118, city: 'Kanpur', rating: 1, comment: 'The delivery partner was rude. The packaging leaked oil all over the bag.', tags: ['delivery', 'rude', 'packaging', 'leaked', 'complaint', 'kanpur'] },
  { id: 119, city: 'Kanpur', rating: 1, comment: 'Extremely slow delivery and no live tracking update for 30 minutes.', tags: ['late', 'delivery', 'slow', 'complaint', 'kanpur'] },
  { id: 120, city: 'Hassan', rating: 5, comment: 'Smooth, hassle-free experience. Great value for the price and super quick.', tags: ['praise', 'value', 'price', 'fast', 'hassan'] },
  { id: 121, city: 'Hassan', rating: 5, comment: 'Great eco-friendly packaging. Delivered right on time.', tags: ['packaging', 'eco', 'praise', 'fast', 'hassan'] },
  { id: 122, city: 'Pondicherry', rating: 2, comment: 'The delivery partner was rude and left the parcel on the wet steps.', tags: ['delivery', 'rude', 'complaint', 'pondicherry'] },
  { id: 123, city: 'Pondicherry', rating: 5, comment: 'Clean paper packaging, fresh seafood platter, and friendly courier.', tags: ['packaging', 'praise', 'fresh', 'delivery', 'pondicherry'] },
];

// ============================================================================
// PRE-SEEDED SAVED THREADS (IMMEDIATELY EXPLORABLE IN SIDEBAR)
// ============================================================================

const SEEDED_THREADS = [
  {
    id: 'seed-dual-gmv-delhi',
    title: 'Top cities by GMV & Delhi complaints',
    updatedAt: 'Today, 2:14 PM',
    cityFilter: 'All Cities',
    messages: [
      {
        id: 'm-seed-1',
        role: 'user',
        content: 'Top cities by GMV and main complaints in Delhi?',
        timestamp: '2:14 PM',
      },
      {
        id: 'm-seed-2',
        role: 'assistant',
        modeUsed: 'dual',
        latencyMs: 318,
        sourceEngine: 'demo',
        content:
          "The top cities by GMV are Bangalore (59,326), Mumbai (48,505), Hyderabad (43,599), and Delhi (27,781). In Delhi, the primary customer complaints are 'delivery partner was rude', 'packaging leaked curry', and recent quality drops alongside longer delivery times.",
        sqlResult: {
          sql: `SELECT
  city,
  ROUND(SUM(gmv), 0) AS total_gmv
FROM MART_DAILY_CITY_REVENUE
GROUP BY city
ORDER BY total_gmv DESC
LIMIT 4`,
          columns: ['city', 'total_gmv'],
          rows: [
            { city: 'Bangalore', total_gmv: 59326 },
            { city: 'Mumbai', total_gmv: 48505 },
            { city: 'Hyderabad', total_gmv: 43599 },
            { city: 'Delhi', total_gmv: 27781 },
          ],
          chartTitle: 'Cities by GMV',
          valueSuffix: '',
        },
        sources: [
          {
            city: 'Delhi',
            rating: 2,
            comment: 'The delivery partner was very rude and arrived late without apologizing.',
            score: 0.91,
          },
          {
            city: 'Delhi',
            rating: 1,
            comment: 'The packaging leaked curry everywhere and the food arrived completely cold.',
            score: 0.88,
          },
          {
            city: 'Delhi',
            rating: 1,
            comment: 'Quality has really dropped lately. Portions shrunk while prices went up.',
            score: 0.84,
          },
          {
            city: 'Delhi',
            rating: 2,
            comment: 'Delivery partner was rude on the phone and refused to bring it to the gate.',
            score: 0.82,
          },
          {
            city: 'Delhi',
            rating: 2,
            comment: 'Order took 55 minutes and the containers were crushed inside the bag.',
            score: 0.79,
          },
        ],
      },
    ],
  },
  {
    id: 'seed-cancel-payment',
    title: 'Cancel rate by payment method',
    updatedAt: 'Today, 1:42 PM',
    cityFilter: 'All Cities',
    messages: [
      {
        id: 'm-seed-3',
        role: 'user',
        content: 'Cancel rate by payment method',
        timestamp: '1:42 PM',
      },
      {
        id: 'm-seed-4',
        role: 'assistant',
        modeUsed: 'sql',
        latencyMs: 245,
        sourceEngine: 'demo',
        content:
          'Cash on Delivery has the highest cancellation rate at 14.8% (more than 3.6× higher than UPI at 4.1%). Prepaid methods—UPI, Debit Card, and Credit Card—consistently show the strongest order completion rates across FCT_ORDERS.',
        sqlResult: {
          sql: `SELECT
  payment_method,
  ROUND(100.0 * AVG(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END), 1) AS cancel_rate_pct
FROM FCT_ORDERS
GROUP BY payment_method
ORDER BY cancel_rate_pct DESC
LIMIT 10`,
          columns: ['payment_method', 'cancel_rate_pct'],
          rows: PAYMENT_METRICS.map((p) => ({
            payment_method: p.payment_method,
            cancel_rate_pct: p.cancel_rate,
          })),
          chartTitle: 'Cancel Rate (%) by Payment Method',
          valueSuffix: '%',
        },
        sources: [],
      },
    ],
  },
];

// ============================================================================
// UTILITY FUNCTIONS & DEMO INTELLIGENCE SIMULATOR
// ============================================================================

function formatNumber(val, suffix = '') {
  if (typeof val !== 'number' || Number.isNaN(val)) return String(val ?? '');
  if (Number.isInteger(val)) {
    return `${val.toLocaleString()}${suffix}`;
  }
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`;
}

function detectCityInText(text) {
  const lower = text.toLowerCase();
  for (const city of CITIES) {
    if (city !== 'All Cities' && lower.includes(city.toLowerCase())) {
      return city;
    }
  }
  return null;
}

function scoreReviewMatch(query, review) {
  const qTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const haystack = `${review.comment.toLowerCase()} ${review.city.toLowerCase()} ${review.tags.join(' ')}`;
  let hits = 0;

  for (const token of qTokens) {
    if (haystack.includes(token)) {
      hits += 1;
    }
  }

  // Boost sentiment intent alignment
  const lowerQ = query.toLowerCase();
  const askingComplaint =
    lowerQ.includes('complain') ||
    lowerQ.includes('bad') ||
    lowerQ.includes('worst') ||
    lowerQ.includes('issue') ||
    lowerQ.includes('problem') ||
    lowerQ.includes('rude') ||
    lowerQ.includes('leak') ||
    lowerQ.includes('late');
  const askingPraise =
    lowerQ.includes('praise') ||
    lowerQ.includes('good') ||
    lowerQ.includes('best') ||
    lowerQ.includes('love') ||
    lowerQ.includes('eco') ||
    lowerQ.includes('great');

  let sentimentBoost = 0;
  if (askingComplaint && review.rating <= 2) sentimentBoost = 0.24;
  if (askingPraise && review.rating >= 4) sentimentBoost = 0.24;

  const base = 0.56 + Math.min(hits * 0.08, 0.28) + sentimentBoost;
  return Math.min(0.96, Number(base.toFixed(2)));
}

function runSimulatedRAG(question, activeCityFilter) {
  const mentionedCity = detectCityInText(question);
  const targetCity =
    activeCityFilter && activeCityFilter !== 'All Cities'
      ? activeCityFilter
      : mentionedCity;

  let pool = targetCity
    ? SAMPLE_REVIEWS.filter((r) => r.city.toLowerCase() === targetCity.toLowerCase())
    : [...SAMPLE_REVIEWS];

  if (pool.length === 0) {
    pool = [...SAMPLE_REVIEWS];
  }

  const scored = pool
    .map((r) => ({
      city: r.city,
      rating: r.rating,
      comment: r.comment,
      score: scoreReviewMatch(question, r),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const lower = question.toLowerCase();
  const cityLabel = targetCity ? ` in ${targetCity}` : '';

  let summary = '';
  if (lower.includes('packaging') && (lower.includes('praise') || lower.includes('good') || lower.includes('love'))) {
    summary = `Customers${cityLabel} frequently praise the eco-friendly and biodegradable packaging, noting tamper-proof sealed boxes, zero gravy spillage, and sturdy spill-proof containers that keep meals piping hot on arrival.`;
  } else if (lower.includes('complain') || lower.includes('rude') || lower.includes('issue') || lower.includes('problem')) {
    const lowRated = scored.filter((s) => s.rating <= 2);
    const themes = [];
    if (lowRated.some((r) => r.comment.toLowerCase().includes('rude'))) themes.push('rude delivery partner behavior');
    if (lowRated.some((r) => r.comment.toLowerCase().includes('leak') || r.comment.toLowerCase().includes('crush'))) themes.push('leaked or damaged packaging');
    if (lowRated.some((r) => r.comment.toLowerCase().includes('late') || r.comment.toLowerCase().includes('minute') || r.comment.toLowerCase().includes('slow'))) themes.push('late deliveries');
    if (lowRated.some((r) => r.comment.toLowerCase().includes('quality') || r.comment.toLowerCase().includes('expensive'))) themes.push('declining food quality and high fees');

    const themeText = themes.length > 0 ? themes.join(', ') : 'inconsistent delivery and order quality';
    summary = `Based on the top ${scored.length} semantically matched reviews${cityLabel}, the main complaints center on ${themeText}.`;
  } else {
    const avgStars = (scored.reduce((acc, r) => acc + r.rating, 0) / Math.max(scored.length, 1)).toFixed(1);
    summary = `Across the top ${scored.length} matching customer reviews${cityLabel} (average ${avgStars}/5 ★), diners highlight both strong eco-friendly packaging on high-rated orders and friction around delivery partner etiquette or late arrivals on lower-rated orders.`;
  }

  return { answer: summary, sources: scored };
}

function runSimulatedSQL(question, activeCityFilter) {
  const lower = question.toLowerCase();
  const targetCity =
    activeCityFilter && activeCityFilter !== 'All Cities'
      ? activeCityFilter
      : detectCityInText(question);

  // 1. Cancel rate by payment method
  if (lower.includes('payment') || (lower.includes('cancel') && !lower.includes('city'))) {
    const whereClause = targetCity ? `\nWHERE city = '${targetCity}'` : '';
    const rows = PAYMENT_METRICS.map((p) => ({
      payment_method: p.payment_method,
      cancel_rate_pct: Number(
        (targetCity ? Math.max(2.1, p.cancel_rate + (targetCity === 'Delhi' ? 2.4 : -0.8)) : p.cancel_rate).toFixed(1)
      ),
    }));
    return {
      answer: `${rows[0].payment_method} drives the highest cancellation rate at ${rows[0].cancel_rate_pct}%${targetCity ? ` in ${targetCity}` : ''}, while UPI remains the most reliable payment method at ${rows[rows.length - 1].cancel_rate_pct}%.`,
      sqlResult: {
        sql: `SELECT
  payment_method,
  ROUND(100.0 * AVG(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END), 1) AS cancel_rate_pct
FROM FCT_ORDERS${whereClause}
GROUP BY payment_method
ORDER BY cancel_rate_pct DESC
LIMIT 10`,
        columns: ['payment_method', 'cancel_rate_pct'],
        rows,
        chartTitle: `Cancel Rate (%) by Payment Method${targetCity ? ` (${targetCity})` : ''}`,
        valueSuffix: '%',
      },
    };
  }

  // 2. Cuisine demand
  if (lower.includes('cuisine') || lower.includes('cuisin') || lower.includes('dish')) {
    const whereClause = targetCity ? `\nWHERE city = '${targetCity}'` : '';
    const scale = targetCity ? 0.24 : 1;
    const rows = CUISINE_METRICS.map((c) => ({
      cuisine: c.cuisine,
      total_orders: Math.round(c.orders * scale),
    }));
    return {
      answer: `${rows[0].cuisine} leads order volume${targetCity ? ` in ${targetCity}` : ''} with ${rows[0].total_orders.toLocaleString()} orders, followed closely by ${rows[1].cuisine} (${rows[1].total_orders.toLocaleString()}) and ${rows[2].cuisine} (${rows[2].total_orders.toLocaleString()}).`,
      sqlResult: {
        sql: `SELECT
  cuisine,
  COUNT(order_id) AS total_orders
FROM FCT_ORDERS${whereClause}
GROUP BY cuisine
ORDER BY total_orders DESC
LIMIT 10`,
        columns: ['cuisine', 'total_orders'],
        rows,
        chartTitle: `Orders by Cuisine${targetCity ? ` (${targetCity})` : ''}`,
        valueSuffix: '',
      },
    };
  }

  // 3. Delivery time / SLA by city
  if (lower.includes('delivery time') || lower.includes('sla') || lower.includes('slow') || lower.includes('late')) {
    const filtered = targetCity
      ? CITY_METRICS.filter((c) => c.city === targetCity)
      : [...CITY_METRICS].sort((a, b) => b.avg_delivery_min - a.avg_delivery_min).slice(0, 6);
    const rows = filtered.map((c) => ({
      city: c.city,
      avg_delivery_min: c.avg_delivery_min,
    }));
    return {
      answer: targetCity
        ? `${targetCity} averages ${rows[0].avg_delivery_min} minutes per delivery across MART_DELIVERY_SLA.`
        : `${rows[0].city} (${rows[0].avg_delivery_min} min) and ${rows[1].city} (${rows[1].avg_delivery_min} min) record the slowest average delivery times, whereas ${CITY_METRICS[6].city} (${CITY_METRICS[6].avg_delivery_min} min) leads SLA speed.`,
      sqlResult: {
        sql: `SELECT
  city,
  ROUND(AVG(p50_delivery_min), 1) AS avg_delivery_min
FROM MART_DELIVERY_SLA${targetCity ? `\nWHERE city = '${targetCity}'` : ''}
GROUP BY city
ORDER BY avg_delivery_min DESC
LIMIT 10`,
        columns: ['city', 'avg_delivery_min'],
        rows,
        chartTitle: 'Avg Delivery Time (min) — Worst First',
        valueSuffix: 'm',
      },
    };
  }

  // 4. Restaurants performance
  if (lower.includes('restaurant')) {
    const filtered = targetCity
      ? RESTAURANT_METRICS.filter((r) => r.city === targetCity)
      : RESTAURANT_METRICS;
    const list = filtered.length > 0 ? filtered : RESTAURANT_METRICS;
    const rows = list.map((r) => ({
      restaurant_name: r.restaurant_name,
      revenue: r.revenue,
    }));
    return {
      answer: `${rows[0].restaurant_name} tops restaurant revenue${targetCity ? ` in ${targetCity}` : ''} at ${rows[0].revenue.toLocaleString()} delivered GMV based on MART_RESTAURANT_PERFORMANCE.`,
      sqlResult: {
        sql: `SELECT
  restaurant_name,
  ROUND(SUM(revenue), 0) AS revenue
FROM MART_RESTAURANT_PERFORMANCE${targetCity ? `\nWHERE city = '${targetCity}'` : ''}
GROUP BY restaurant_name
ORDER BY revenue DESC
LIMIT 10`,
        columns: ['restaurant_name', 'revenue'],
        rows,
        chartTitle: `Top Restaurants by Revenue${targetCity ? ` (${targetCity})` : ''}`,
        valueSuffix: '',
      },
    };
  }

  // 5. Default / Top cities by GMV
  const filtered =
    activeCityFilter && activeCityFilter !== 'All Cities'
      ? CITY_METRICS.filter((c) => c.city === activeCityFilter)
      : CITY_METRICS.slice(0, 6);

  const rows = filtered.map((c) => ({
    city: c.city,
    total_gmv: c.gmv,
  }));

  return {
    answer:
      rows.length === 1
        ? `${rows[0].city} generated ${rows[0].total_gmv.toLocaleString()} in total delivered GMV across MART_DAILY_CITY_REVENUE.`
        : `The top cities by delivered GMV are ${rows[0].city} (${rows[0].total_gmv.toLocaleString()}), ${rows[1].city} (${rows[1].total_gmv.toLocaleString()}), ${rows[2].city} (${rows[2].total_gmv.toLocaleString()}), and ${rows[3].city} (${rows[3].total_gmv.toLocaleString()}).`,
    sqlResult: {
      sql: `SELECT
  city,
  ROUND(SUM(gmv), 0) AS total_gmv
FROM MART_DAILY_CITY_REVENUE${
        activeCityFilter && activeCityFilter !== 'All Cities'
          ? `\nWHERE city = '${activeCityFilter}'`
          : ''
      }
GROUP BY city
ORDER BY total_gmv DESC
LIMIT 10`,
      columns: ['city', 'total_gmv'],
      rows,
      chartTitle: 'Cities by GMV',
      valueSuffix: '',
    },
  };
}

function routeAndSimulate(question, selectedMode, cityFilter) {
  const lower = question.toLowerCase();

  const wantsSQL =
    lower.includes('gmv') ||
    lower.includes('revenue') ||
    lower.includes('top ') ||
    lower.includes('most orders') ||
    lower.includes('cuisine') ||
    lower.includes('cancel') ||
    lower.includes('payment') ||
    lower.includes('average') ||
    lower.includes('avg') ||
    lower.includes('delivery time') ||
    lower.includes('sla') ||
    lower.includes('count') ||
    lower.includes('restaurant');

  const wantsRAG =
    lower.includes('complain') ||
    lower.includes('review') ||
    lower.includes('praise') ||
    lower.includes('packaging') ||
    lower.includes('rude') ||
    lower.includes('feedback') ||
    lower.includes('why are') ||
    lower.includes('customers say') ||
    lower.includes('sentiment');

  if (selectedMode === 'sql') {
    const res = runSimulatedSQL(question, cityFilter);
    return { modeUsed: 'sql', content: res.answer, sqlResult: res.sqlResult, sources: [] };
  }

  if (selectedMode === 'rag') {
    const res = runSimulatedRAG(question, cityFilter);
    return { modeUsed: 'rag', content: res.answer, sqlResult: null, sources: res.sources };
  }

  // AUTO MODE: detect Dual vs SQL vs RAG
  if (wantsSQL && wantsRAG) {
    const sqlRes = runSimulatedSQL(question, cityFilter);
    const ragRes = runSimulatedRAG(question, cityFilter);
    // For dual queries, keep top 4 cities in chart for crisp side-by-side layout
    const compactRows = sqlRes.sqlResult.rows.slice(0, 4);
    return {
      modeUsed: 'dual',
      content: `${sqlRes.answer} ${ragRes.answer}`,
      sqlResult: { ...sqlRes.sqlResult, rows: compactRows },
      sources: ragRes.sources,
    };
  }

  if (wantsSQL) {
    const res = runSimulatedSQL(question, cityFilter);
    return { modeUsed: 'sql', content: res.answer, sqlResult: res.sqlResult, sources: [] };
  }

  const res = runSimulatedRAG(question, cityFilter);
  return { modeUsed: 'rag', content: res.answer, sqlResult: null, sources: res.sources };
}

// ============================================================================
// SAFE REACT SQL SYNTAX HIGHLIGHTER (NO dangerouslySetInnerHTML)
// ============================================================================

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'DESC', 'ASC',
  'LIMIT', 'AS', 'AND', 'OR', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'ROUND', 'SUM', 'AVG', 'COUNT', 'DISTINCT', 'WITH', 'JOIN', 'ON', 'IN', 'IS', 'NOT', 'NULL',
]);

function SqlCodeBlock({ sql }) {
  const lines = sql.split('\n');

  const renderLine = (line, lineIdx) => {
    // Split preserving string literals, words, numbers, and punctuation
    const tokens = line.match(/('[^']*'|"[^"]*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[^\sA-Za-z0-9_']+|\s+)/g) || [line];
    return (
      <div key={lineIdx} className="leading-6">
        <span className="inline-block w-6 select-none text-right pr-3 text-[#78716C] text-[11px]">
          {lineIdx + 1}
        </span>
        {tokens.map((tok, i) => {
          if (tok.startsWith("'") || tok.startsWith('"')) {
            return (
              <span key={i} className="text-[#6EE7B7]">
                {tok}
              </span>
            );
          }
          if (/^\d+(\.\d+)?$/.test(tok)) {
            return (
              <span key={i} className="text-[#FCA5A5]">
                {tok}
              </span>
            );
          }
          if (SQL_KEYWORDS.has(tok.toUpperCase())) {
            return (
              <span key={i} className="font-bold text-[#F2C94C]">
                {tok}
              </span>
            );
          }
          return (
            <span key={i} className="text-[#F7F3EA]">
              {tok}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border-[1.5px] border-[#141413] bg-[#141413] px-3.5 py-3 font-mono text-xs shadow-[2px_2px_0px_#F2C94C]">
      {lines.map(renderLine)}
    </div>
  );
}

// ============================================================================
// NEO-BRUTALIST RESPONSIVE SVG BAR CHART
// ============================================================================

function NeoBrutalistBarChart({ rows, columns, title, valueSuffix = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!rows || rows.length === 0 || !columns || columns.length < 2) return null;

  const labelKey = columns[0];
  const valueKey = columns[1];

  const data = rows.map((r) => ({
    label: String(r[labelKey] ?? ''),
    value: Number(r[valueKey] ?? 0),
  }));

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const svgWidth = Math.max(360, data.length * 76);
  const svgHeight = 205;
  const padTop = 34;
  const padBottom = 42;
  const padX = 22;
  const chartHeight = svgHeight - padTop - padBottom;
  const chartWidth = svgWidth - padX * 2;
  const slotWidth = chartWidth / data.length;
  const barWidth = Math.min(48, Math.max(24, slotWidth * 0.58));

  return (
    <div className="w-full">
      {title && (
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-extrabold tracking-tight text-[#141413] sm:text-sm">
            {title}
          </h4>
          {hoveredIdx !== null && data[hoveredIdx] && (
            <span className="rounded-md border border-[#141413] bg-[#F2C94C] px-2 py-0.5 text-[11px] font-bold text-[#141413]">
              {data[hoveredIdx].label}: {formatNumber(data[hoveredIdx].value, valueSuffix)}
            </span>
          )}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-auto w-full min-w-[280px] select-none"
          role="img"
          aria-label={title || 'Bar chart'}
        >
          {/* Subtle horizontal guide lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padX}
                x2={svgWidth - padX}
                y1={y}
                y2={y}
                stroke="#141413"
                strokeOpacity="0.1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Baseline */}
          <line
            x1={padX}
            x2={svgWidth - padX}
            y1={padTop + chartHeight}
            y2={padTop + chartHeight}
            stroke="#141413"
            strokeWidth="1.5"
          />

          {/* Bars */}
          {data.map((d, idx) => {
            const barH = Math.max(6, (d.value / maxVal) * chartHeight);
            const x = padX + idx * slotWidth + (slotWidth - barWidth) / 2;
            const y = padTop + chartHeight - barH;
            const isHovered = hoveredIdx === idx;
            const shortLabel =
              d.label.length > 12 ? `${d.label.slice(0, 11)}…` : d.label;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Hard offset shadow behind active/hovered bar */}
                {isHovered && (
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    fill="#141413"
                  />
                )}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  fill={isHovered ? '#F8D66D' : '#F2C94C'}
                  stroke="#141413"
                  strokeWidth="1.6"
                  style={{ transition: 'fill 150ms ease' }}
                />
                {/* Value label above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#141413"
                  fontSize="11.5"
                  fontWeight="800"
                >
                  {formatNumber(d.value, valueSuffix)}
                </text>
                {/* Category label below baseline */}
                <text
                  x={x + barWidth / 2}
                  y={padTop + chartHeight + 18}
                  textAnchor="middle"
                  fill="#141413"
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// ASSISTANT RESPONSE CARD COMPONENT
// ============================================================================

function AssistantMessageCard({ message, isLatest }) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [dataView, setDataView] = useState('chart');
  const [showReviews, setShowReviews] = useState(isLatest);

  const hasSQL = Boolean(message.sqlResult && message.sqlResult.rows?.length > 0);
  const hasRAG = Boolean(message.sources && message.sources.length > 0);
  const isDual = hasSQL && hasRAG;

  const canRenderChart = useMemo(() => {
    if (!hasSQL) return false;
    const cols = message.sqlResult.columns || [];
    if (cols.length !== 2) return false;
    const firstVal = message.sqlResult.rows[0]?.[cols[1]];
    return typeof firstVal === 'number' && !Number.isNaN(firstVal);
  }, [hasSQL, message.sqlResult]);

  const handleCopySql = () => {
    if (!message.sqlResult?.sql) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message.sqlResult.sql).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flagship-card w-full rounded-2xl bg-white p-5 sm:p-6">
      {/* Card Header: Mode Tags + Latency + Copy SQL */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {(message.modeUsed === 'sql' || message.modeUsed === 'dual') && (
            <span className="inline-flex items-center overflow-hidden rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] text-[11px] font-black tracking-wide text-[#141413] shadow-[2px_2px_0px_#141413]">
              <span className="border-r-[1.5px] border-[#141413] bg-[#F7D979] px-1.5 py-0.5">
                01
              </span>
              <span className="px-2 py-0.5">SQL ANALYTICS</span>
            </span>
          )}

          {(message.modeUsed === 'rag' || message.modeUsed === 'dual') && (
            <span className="inline-flex items-center overflow-hidden rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] text-[11px] font-black tracking-wide text-[#141413] shadow-[2px_2px_0px_#141413]">
              <span className="border-r-[1.5px] border-[#141413] bg-[#F7D979] px-1.5 py-0.5">
                {message.modeUsed === 'dual' ? '02' : '01'}
              </span>
              <span className="px-2 py-0.5">REVIEWS RAG</span>
            </span>
          )}

          {message.latencyMs && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#141413]/25 bg-[#F7F3EA] px-2.5 py-0.5 text-[11px] font-semibold text-[#57534E]">
              <Clock className="h-3 w-3" />
              {message.latencyMs}ms
            </span>
          )}

          {message.sourceEngine && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#141413]/20 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#57534E]">
              {message.sourceEngine === 'live' ? 'Live :8000' : 'Demo Engine'}
            </span>
          )}
        </div>

        {/* Right Header Action: Copy SQL */}
        {hasSQL && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSql((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#141413] bg-[#F7F3EA] px-3 py-1.5 text-xs font-bold text-[#141413] transition-colors hover:bg-[#EFE9DC]"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showSql ? 'Hide SQL' : 'View Generated SQL'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#141413] px-3.5 py-1.5 text-xs font-semibold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#F2C94C]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Grounded Summary Text */}
      <p className="text-sm leading-relaxed font-medium text-[#141413] sm:text-[15px]">
        {message.content}
      </p>

      {/* Collapsible SQL Code Block */}
      {hasSQL && showSql && <SqlCodeBlock sql={message.sqlResult.sql} />}

      {/* Artifacts Container: Side-by-side on desktop when Dual, Full-width otherwise */}
      {(hasSQL || hasRAG) && (
        <div
          className={`mt-4 grid gap-4 ${
            isDual ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* SQL Panel: Chart View / Data Table */}
          {hasSQL && (
            <div className="flex flex-col justify-between rounded-xl border-[1.5px] border-[#141413]/20 bg-[#F7F3EA] p-4">
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#57534E]">
                    <Database className="h-3.5 w-3.5 text-[#141413]" />
                    Snowflake Result ({message.sqlResult.rows.length} rows)
                  </span>

                  {canRenderChart && (
                    <div className="inline-flex rounded-lg border-[1.5px] border-[#141413] bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setDataView('chart')}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          dataView === 'chart'
                            ? 'bg-[#141413] text-[#F7F3EA]'
                            : 'text-[#141413] hover:bg-[#F7F3EA]'
                        }`}
                      >
                        <BarChart3 className="h-3 w-3" />
                        Chart View
                      </button>
                      <button
                        type="button"
                        onClick={() => setDataView('table')}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          dataView === 'table'
                            ? 'bg-[#141413] text-[#F7F3EA]'
                            : 'text-[#141413] hover:bg-[#F7F3EA]'
                        }`}
                      >
                        <Table2 className="h-3 w-3" />
                        Data Table
                      </button>
                    </div>
                  )}
                </div>

                {canRenderChart && dataView === 'chart' ? (
                  <NeoBrutalistBarChart
                    rows={message.sqlResult.rows}
                    columns={message.sqlResult.columns}
                    title={message.sqlResult.chartTitle}
                    valueSuffix={message.sqlResult.valueSuffix || ''}
                  />
                ) : (
                  <div className="overflow-x-auto rounded-xl border-[1.5px] border-[#141413] bg-white">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b-[1.5px] border-[#141413] bg-[#EFE9DC]">
                          {message.sqlResult.columns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 font-extrabold uppercase tracking-wider text-[#141413]"
                            >
                              {col.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.sqlResult.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b border-[#141413]/15 last:border-b-0 hover:bg-[#F7F3EA]/70"
                          >
                            {message.sqlResult.columns.map((col, cIdx) => (
                              <td
                                key={col}
                                className={`px-3 py-2 ${
                                  cIdx === 0
                                    ? 'font-bold text-[#141413]'
                                    : 'font-mono font-semibold text-[#141413]'
                                }`}
                              >
                                {typeof row[col] === 'number'
                                  ? formatNumber(
                                      row[col],
                                      cIdx === 1 ? message.sqlResult.valueSuffix || '' : ''
                                    )
                                  : String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RAG Panel: Collapsible Retrieved Reviews */}
          {hasRAG && (
            <div className="flex flex-col rounded-xl border-[1.5px] border-[#141413]/20 bg-[#F7F3EA] p-4">
              <button
                type="button"
                onClick={() => setShowReviews((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl bg-[#141413] px-4 py-2.5 text-xs font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.99]"
              >
                <span className="inline-flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-[#F2C94C]" />
                  Inspect {message.sources.length} Retrieved Reviews
                </span>
                {showReviews ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showReviews && (
                <div className="mt-3 space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scroll">
                  {message.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border-[1.5px] border-[#141413] bg-white p-3 transition-transform hover:-translate-y-[1px]"
                    >
                      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-[#141413] bg-[#F2C94C] px-2 py-0.5 text-[11px] font-black text-[#141413]">
                            {src.rating}/5
                            <Star className="h-2.5 w-2.5 fill-[#141413] text-[#141413]" />
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#141413]">
                            <MapPin className="h-3 w-3 text-[#57534E]" />
                            {src.city}
                          </span>
                        </div>
                        {typeof src.score === 'number' && (
                          <span className="rounded-full border border-[#141413]/20 bg-[#F7F3EA] px-2 py-0.5 font-mono text-[10px] font-bold text-[#57534E]">
                            {Math.round(src.score * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[#141413]">
                        {src.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Load threads safely from localStorage
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
    return SEEDED_THREADS;
  });

  // Start on null (fresh Editorial Welcome Screen) so starter cards & saved threads are both immediately showcased
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Composer & filter states
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [mode, setMode] = useState('auto'); // 'auto' | 'rag' | 'sql'
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  // Connection mode: 'auto' tries localhost:8000 then falls back cleanly; 'demo' uses built-in simulator directly
  const [connectionPref, setConnectionPref] = useState('auto'); // 'auto' | 'demo'
  const [apiStatus, setApiStatus] = useState('standby'); // 'standby' | 'live' | 'fallback'

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Persist threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // Ignore quota or sandbox errors
    }
  }, [threads]);

  // Active thread object
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const activeMessages = activeThread ? activeThread.messages : [];

  // Auto-scroll chat viewport on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isLoading]);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  // Probe local FastAPI metadata once quietly on mount if connectionPref === 'auto'
  useEffect(() => {
    if (connectionPref !== 'auto') {
      setApiStatus('standby');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);

    fetch(`${API_BASE_URL}/api/metadata`, { signal: controller.signal })
      .then((res) => {
        if (res.ok) setApiStatus('live');
        else setApiStatus('fallback');
      })
      .catch(() => setApiStatus('fallback'))
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [connectionPref]);

  const handleNewChat = () => {
    setActiveThreadId(null);
    setInput('');
    setMobileDrawerOpen(false);
  };

  const handleClearThread = () => {
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, messages: [], updatedAt: 'Just now' } : t
      )
    );
  };

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  };

  const handleSelectThread = (thread) => {
    setActiveThreadId(thread.id);
    if (thread.cityFilter) setCityFilter(thread.cityFilter);
    setMobileDrawerOpen(false);
  };

  const toggleConnectionPref = () => {
    setConnectionPref((prev) => (prev === 'auto' ? 'demo' : 'auto'));
  };

  const sendMessage = useCallback(
    async (overridePrompt, overrideMode) => {
      const promptText = (overridePrompt ?? input).trim();
      if (!promptText || isLoading) return;

      const effectiveMode = overrideMode || mode;
      const nowTime = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });

      const userMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: promptText,
        timestamp: nowTime,
      };

      // Create thread on first message or append to current
      let targetThreadId = activeThreadId;
      if (!targetThreadId) {
        targetThreadId = `thread-${Date.now()}`;
        const shortTitle =
          promptText.length > 38 ? `${promptText.slice(0, 38)}…` : promptText;
        const newThread = {
          id: targetThreadId,
          title: shortTitle,
          updatedAt: 'Just now',
          cityFilter,
          messages: [userMsg],
        };
        setThreads((prev) => [newThread, ...prev]);
        setActiveThreadId(targetThreadId);
      } else {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === targetThreadId
              ? {
                  ...t,
                  title: t.messages.length === 0 ? promptText.slice(0, 38) : t.title,
                  updatedAt: 'Just now',
                  messages: [...t.messages, userMsg],
                }
              : t
          )
        );
      }

      setInput('');
      setIsLoading(true);
      setLoadingStage(
        effectiveMode === 'sql'
          ? `Generating Snowflake SQL & querying MARTS via ${MODEL_NAME}...`
          : effectiveMode === 'rag'
          ? `Searching local embeddings & querying ${MODEL_NAME}...`
          : `Searching Snowflake embeddings & querying ${MODEL_NAME}...`
      );

      const startedAt = performance.now();
      let assistantPayload = null;

      // 1. Try live FastAPI server on :8000 when in Auto mode
      if (connectionPref === 'auto') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              question: promptText,
              mode: effectiveMode,
              city: cityFilter,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setApiStatus('live');
            const latencyMs = Math.max(85, Math.round(performance.now() - startedAt));

            const normalizedSql =
              data.sql_result ||
              (data.sql && data.rows
                ? {
                    sql: data.sql,
                    columns: data.columns || Object.keys(data.rows[0] || {}),
                    rows: data.rows,
                    chartTitle: 'Snowflake Query Result',
                    valueSuffix: '',
                  }
                : null);

            assistantPayload = {
              id: `a-${Date.now()}`,
              role: 'assistant',
              modeUsed:
                data.mode_used ||
                (normalizedSql && data.sources?.length
                  ? 'dual'
                  : normalizedSql
                  ? 'sql'
                  : 'rag'),
              content: data.answer || 'Query completed.',
              sqlResult: normalizedSql,
              sources: data.sources || [],
              latencyMs: data.latency_ms || latencyMs,
              sourceEngine: 'live',
            };
          } else {
            setApiStatus('fallback');
          }
        } catch {
          setApiStatus('fallback');
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // 2. Seamless realistic Zomato demo simulator fallback
      if (!assistantPayload) {
        await new Promise((resolve) => setTimeout(resolve, 520));
        const simulated = routeAndSimulate(promptText, effectiveMode, cityFilter);
        const latencyMs = Math.round(210 + Math.random() * 190);
        assistantPayload = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          modeUsed: simulated.modeUsed,
          content: simulated.content,
          sqlResult: simulated.sqlResult,
          sources: simulated.sources,
          latencyMs,
          sourceEngine: 'demo',
        };
      }

      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetThreadId
            ? { ...t, updatedAt: 'Just now', messages: [...t.messages, assistantPayload] }
            : t
        )
      );
      setIsLoading(false);
    },
    [input, isLoading, mode, activeThreadId, cityFilter, connectionPref]
  );

  // Reusable Sidebar Content for Desktop & Mobile Drawer
  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#EFE9DC] p-4 text-[#141413]">
      <div className="flex flex-col space-y-5 overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#141413]">
              Zomato
            </span>
            <span className="inline-flex items-center justify-center rounded-md border-[1.5px] border-[#141413] bg-[#F2C94C] px-1.5 py-0.5 text-xs font-black text-[#141413] shadow-[2px_2px_0px_#141413]">
              AI
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              setMobileDrawerOpen(false);
            }}
            title="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-[#141413] transition-colors hover:border-[#141413]/20 hover:bg-[#E5DEC9]"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Full-Width shadcn Solid Black "+ New Chat" Button */}
        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#141413] px-4 py-3 text-sm font-bold text-[#F7F3EA] shadow-[3px_3px_0px_#F2C94C] transition-all hover:bg-[#262624] active:translate-y-[1px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        {/* City Filter Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="city-filter"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#141413]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            City Filter
          </label>
          <div className="relative">
            <select
              id="city-filter"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border-[1.5px] border-[#141413] bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-[#141413] shadow-[2px_2px_0px_#141413] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#141413]" />
          </div>
        </div>

        {/* Recent Chats List */}
        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#57534E]">
              Recent Chats
            </span>
            <span className="rounded-md bg-[#141413]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#141413]">
              {threads.length}
            </span>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scroll">
            {threads.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#141413]/25 p-3 text-xs text-[#57534E]">
                No saved conversations yet. Start a query below.
              </p>
            ) : (
              threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectThread(thread);
                    }}
                    className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl border-[1.5px] px-3 py-2.5 text-xs transition-all ${
                      isActive
                        ? 'border-[#141413] bg-white font-bold text-[#141413] shadow-[2px_2px_0px_#141413]'
                        : 'border-transparent bg-transparent font-medium text-[#141413]/85 hover:border-[#141413]/25 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <MessageSquare
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-[#141413]' : 'text-[#57534E]'
                        }`}
                      />
                      <span className="truncate">{thread.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      title="Delete thread"
                      className="rounded-md p-1 text-[#57534E] opacity-0 transition-opacity hover:bg-[#141413] hover:text-[#F7F3EA] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Pipeline Status & Connection Toggle Card */}
      <div className="mt-4 rounded-xl border-[1.5px] border-[#141413] bg-white p-3 shadow-[3px_3px_0px_#141413]">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#141413]">
          <Database className="h-4 w-4 shrink-0" />
          <span className="truncate">Snowflake + Groq</span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-[#57534E]">
          {MODEL_NAME}
        </p>

        <button
          type="button"
          onClick={toggleConnectionPref}
          className="mt-2.5 flex w-full items-center justify-between rounded-lg border border-[#141413]/20 bg-[#F7F3EA] px-2.5 py-1.5 text-[11px] font-bold text-[#141413] transition-colors hover:border-[#141413]"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            {connectionPref === 'auto' && apiStatus === 'live' ? (
              <Wifi className="h-3 w-3 shrink-0 text-emerald-700" />
            ) : (
              <WifiOff className="h-3 w-3 shrink-0 text-[#57534E]" />
            )}
            <span className="truncate">
              {connectionPref === 'auto'
                ? 'Auto (Local API :8000 / Demo)'
                : 'Built-in Demo Simulator'}
            </span>
          </span>
          <span
            className={`ml-1.5 h-2 w-2 shrink-0 rounded-full border border-[#141413] ${
              connectionPref === 'auto' && apiStatus === 'live'
                ? 'bg-emerald-500'
                : 'bg-[#F2C94C]'
            }`}
          />
        </button>

        <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-[#57534E]">
          <span>
            {connectionPref === 'demo'
              ? 'Demo dataset active'
              : apiStatus === 'live'
              ? 'Connected to :8000'
              : 'API :8000 offline → Demo ready'}
          </span>
          <span className="underline">Switch</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F7F3EA] text-[#141413] antialiased">
      {/* Custom Editorial Neo-Brutalist Utilities */}
      <style>{`
        .flagship-card {
          border: 1.5px solid #141413;
          box-shadow: 4px 4px 0px #141413;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .flagship-card-interactive:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #141413;
        }
        .marker-underline {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .marker-underline::after {
          content: "";
          position: absolute;
          left: -3px;
          right: -3px;
          bottom: 3px;
          height: 11px;
          background-color: #F2C94C;
          border-radius: 999px;
          z-index: -1;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(20, 20, 19, 0.22);
          border-radius: 999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 20, 19, 0.4);
        }
      `}</style>

      {/* Desktop Collapsible Left Sidebar */}
      {sidebarOpen && (
        <aside className="hidden h-full w-[280px] shrink-0 border-r-[1.5px] border-[#141413] md:block">
          {SidebarContent}
        </aside>
      )}

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#141413]/40 backdrop-blur-[1px]"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 h-full w-[280px] border-r-[1.5px] border-[#141413] shadow-2xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Flagship ChatGPT Viewport */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F3EA]">
        {/* Minimal Flagship Top Header */}
        <header className="z-20 flex shrink-0 items-center justify-between border-b-[1.5px] border-[#141413]/15 bg-[#F7F3EA]/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* Mobile Hamburger / Desktop Re-open Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141413] text-[#F7F3EA] transition-colors hover:bg-[#262624] md:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar"
                className="hidden h-9 w-9 items-center justify-center rounded-xl bg-[#141413] text-[#F7F3EA] transition-colors hover:bg-[#262624] md:flex"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            {/* White Rounded-Full Model Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-1.5 text-xs font-bold text-[#141413] shadow-[2px_2px_0px_#141413]">
              <span className="h-2.5 w-2.5 rounded-full border border-[#141413] bg-[#F2C94C]" />
              <span className="font-mono">{MODEL_NAME}</span>
            </div>

            {cityFilter !== 'All Cities' && (
              <span className="hidden items-center gap-1 rounded-full border-[1.5px] border-[#141413] bg-[#F2C94C] px-2.5 py-1 text-[11px] font-black text-[#141413] sm:inline-flex">
                <MapPin className="h-3 w-3" />
                {cityFilter}
              </span>
            )}
          </div>

          {/* Right Header Action: shadcn Solid Black Clear Thread Button */}
          <button
            type="button"
            onClick={activeMessages.length > 0 ? handleClearThread : handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#141413] px-4 py-2 text-xs font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Thread</span>
          </button>
        </header>

        {/* Scrollable Canvas Area */}
        <div className="custom-scroll flex-1 overflow-y-auto px-4 pb-44 pt-6 sm:px-8">
          {activeMessages.length === 0 ? (
            /* ============================================================
             * EDITORIAL WELCOME / EMPTY STATE
             * ============================================================ */
            <div className="mx-auto flex max-w-5xl flex-col justify-center pt-2 sm:pt-6">
              {/* Eyebrow Badge */}
              <div className="mb-4 flex items-center">
                <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-1 text-[11px] font-black tracking-wider text-[#141413] shadow-[2px_2px_0px_#141413]">
                  <span className="h-2.5 w-2.5 rounded-[3px] border border-[#141413] bg-[#F2C94C]" />
                  <span>ZOMATO REVIEW &amp; DATA INTELLIGENCE</span>
                </div>
              </div>

              {/* High-Contrast Display Headline */}
              <h1 className="max-w-3xl text-3xl font-black leading-[1.15] tracking-tight text-[#141413] sm:text-5xl">
                Ask real questions across your{' '}
                <span className="marker-underline">Zomato data &amp; reviews.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-[#57534E] sm:text-base">
                Query Snowflake <span className="font-mono font-bold text-[#141413]">MARTS</span> with live SQL or semantically search local{' '}
                <span className="font-mono font-bold text-[#141413]">STG_REVIEWS</span> embeddings—unified inside one flagship workspace.
              </p>

              {/* 3 Interactive Numbered Neo-Brutalist Starter Cards */}
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {STARTER_CARDS.map((card) => (
                  <button
                    key={card.num}
                    type="button"
                    onClick={() => {
                      setMode(card.recommendedMode);
                      sendMessage(card.prompt, card.recommendedMode);
                    }}
                    className="flagship-card flagship-card-interactive group flex flex-col justify-between rounded-2xl bg-white p-5 text-left"
                  >
                    <div>
                      <div className="mb-5 flex items-center justify-between">
                        <span className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] px-2.5 py-1 text-xs font-black text-[#141413] shadow-[2px_2px_0px_#141413]">
                          {card.num}
                        </span>
                        <span className="rounded-full border border-[#141413]/20 bg-[#F7F3EA] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[#57534E]">
                          {card.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-[#141413]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed font-medium text-[#57534E] sm:text-sm">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t-[1.5px] border-[#141413]/15 pt-3.5 text-xs font-extrabold text-[#141413]">
                      <span className="truncate pr-2">&ldquo;{card.prompt}&rdquo;</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#141413] text-[#F7F3EA] transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Row of 4 Compact Clickable Example Prompt Pills */}
              <div className="mt-7">
                <span className="mb-2.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#57534E]">
                  Quick Prompts
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {EXAMPLE_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => sendMessage(pill, 'auto')}
                      className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-2 text-xs font-bold text-[#141413] shadow-[2px_2px_0px_#141413] transition-all hover:-translate-y-[1px] hover:bg-[#F2C94C] active:translate-y-0"
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>{pill}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================
             * CONVERSATIONAL STREAM
             * ============================================================ */
            <div className="mx-auto max-w-4xl space-y-6">
              {activeMessages.map((msg, idx) => {
                const isLatestAssistant =
                  msg.role === 'assistant' && idx === activeMessages.length - 1;

                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#141413] px-5 py-3.5 text-sm font-semibold leading-relaxed text-[#F7F3EA] shadow-[3px_3px_0px_#F2C94C] sm:max-w-[75%]">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex justify-start">
                    <AssistantMessageCard
                      message={msg}
                      isLatest={isLatestAssistant}
                    />
                  </div>
                );
              })}

              {/* Smooth Animated Thinking Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flagship-card inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-xs font-bold text-[#141413]">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C] [animation-delay:-0.25s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C] [animation-delay:-0.12s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C]" />
                    </span>
                    <span>{loadingStage}</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ============================================================
         * FLOATING BOTTOM FLAGSHIP CHATGPT COMPOSER
         * ============================================================ */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F3EA] via-[#F7F3EA]/95 to-transparent px-4 pb-5 pt-10 sm:px-6">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <div className="flagship-card rounded-2xl bg-white p-3">
              {/* Top Control Row: Segmented Mode Switcher Pill */}
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-full border-[1.5px] border-[#141413] bg-[#F7F3EA] p-0.5">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'rag', label: 'Reviews RAG' },
                    { id: 'sql', label: 'SQL Analytics' },
                  ].map((item) => {
                    const active = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMode(item.id)}
                        className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                          active
                            ? 'bg-[#141413] text-[#F7F3EA] shadow-sm'
                            : 'text-[#141413] hover:bg-[#EFE9DC]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#57534E] sm:flex">
                  <Layers className="h-3.5 w-3.5" />
                  <span>
                    Scope:{' '}
                    <strong className="text-[#141413]">{cityFilter}</strong>
                  </span>
                </div>
              </div>

              {/* Bottom Input Row: Auto-growing Textarea + Solid Black Send Button */}
              <div className="flex items-end gap-2.5">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything about Zomato reviews or metrics..."
                  className="max-h-36 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-medium text-[#141413] placeholder:text-[#57534E] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#141413] px-4 text-sm font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Send</span>
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] font-medium text-[#57534E]">
              Grounded on Snowflake <span className="font-mono">MARTS</span> &amp;{' '}
              <span className="font-mono">STG_REVIEWS</span> • Press{' '}
              <kbd className="rounded border border-[#141413]/30 bg-white px-1 py-0.5 font-mono text-[10px] font-bold text-[#141413]">
                Enter
              </kbd>{' '}
              to send
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}