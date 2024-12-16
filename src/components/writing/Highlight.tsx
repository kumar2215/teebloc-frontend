import React from "react";

interface HighlightProps {
  children: React.ReactNode;
  commentId: string;
  colorClass: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  commentId,
  colorClass,
  isActive,
  onClick,
}) => (
  <span
    className={`cursor-pointer rounded px-0.5 transition-all duration-200 
      ${colorClass}
      ${isActive ? "ring-2 ring-offset-1 ring-blue-500 shadow-sm" : ""}
      hover:opacity-80`}
    onClick={() => onClick(commentId)}
  >
    {children}
  </span>
);
