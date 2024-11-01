import React from "react";
import { MessageSquare } from "lucide-react";
import { Comment } from "./Comment";
import type { Comment as CommentType } from "./types/Comment";

interface CommentPanelProps {
  languageComments: CommentType[];
  contentComments: CommentType[];
  activeComment: string | null;
  activeParagraph: number | null;
  onCommentClick: (id: string) => void;
  activeTab: "language" | "content";
  setActiveTab: (tab: "language" | "content") => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  languageComments,
  contentComments,
  activeComment,
  activeParagraph,
  onCommentClick,
  activeTab,
  setActiveTab,
}) => {
  const currentComments =
    activeTab === "language" ? languageComments : contentComments;

  return (
    <div className="comments-panel relative w-[350px] overflow-y-auto border-l border-gray-200 bg-gray-50">
      <div className="comments-header sticky top-0 z-10 bg-gray-50 shadow-sm">
        <div className="flex items-center gap-2 p-6 pb-4">
          <MessageSquare className="h-5 w-5 text-blue-900" />
          <h3 className="text-lg font-semibold text-blue-900">Comments</h3>
        </div>
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "language"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("language")}
          >
            Language
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "content"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
        </div>
      </div>
      <div className="p-6 pt-2">
        <div className="space-y-4">
          {currentComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              isActive={activeComment === comment.id}
              isExpanded={comment.paragraphId === activeParagraph}
              onClick={onCommentClick}
              isParagraphActive={comment.paragraphId === activeParagraph}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
