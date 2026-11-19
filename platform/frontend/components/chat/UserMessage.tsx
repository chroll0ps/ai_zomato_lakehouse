import React from "react";

interface UserMessageProps {
  content: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-[#141413] px-5 py-3.5 text-sm font-semibold leading-relaxed text-[#F7F3EA] shadow-[3px_3px_0px_#F2C94C] sm:max-w-[75%]">
        {content}
      </div>
    </div>
  );
};

