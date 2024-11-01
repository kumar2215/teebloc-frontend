import React, { useState, useEffect } from "react";
import type { Comment as CommentType } from "./types/Comment";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CommentProps {
  comment: CommentType;
  isActive: boolean;
  isExpanded: boolean;
  onClick: (id: string) => void;
  isParagraphActive: boolean;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  isActive,
  isExpanded: defaultExpanded,
  onClick,
  isParagraphActive,
}) => {
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const isExpanded = isManuallyExpanded || defaultExpanded;

  useEffect(() => {
    if (!isParagraphActive) {
      setIsManuallyExpanded(false);
    }
  }, [isParagraphActive]);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManuallyExpanded(!isManuallyExpanded);
  };

  return (
    <div
      data-paragraph-id={comment.paragraphId}
      onClick={() => onClick(comment.id)}
      className={`cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-md
        ${isActive ? "translate-x-[-4px] ring-2 ring-blue-500" : ""}
        ${isParagraphActive ? "ring-2 ring-blue-200 bg-blue-50" : ""}
        ${isActive ? "border-l-4" : "border-gray-200"}`}
      style={{
        borderLeftColor: isActive
          ? comment.darkColorClass.replace("bg-[", "").replace("]", "")
          : undefined,
      }}
    >
      <div className="flex items-center gap-2 p-4">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white`}
          style={{
            backgroundColor: comment.darkColorClass
              .replace("bg-[", "")
              .replace("]", ""),
          }}
        >
          {comment.id}
        </span>
        <strong className="text-sm flex-1">{comment.title}</strong>
        <button
          onClick={handleChevronClick}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-300" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-300" />
          )}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-32" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};
