import React from "react";
import { MessageSquare } from "lucide-react";
import { Comment } from "./Comment";
import type { Comment as CommentType } from "./types/Comment";

interface CommentPanelProps {
  comments: CommentType[];
  activeComment: string | null;
  activeParagraph: number | null;
  onCommentClick: (id: string) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  activeComment,
  activeParagraph,
  onCommentClick,
}) => {
  return (
    <div className="comments-panel relative w-[350px] overflow-y-auto border-l border-gray-200 bg-gray-50">
      <div className="comments-header sticky top-0 z-10 bg-gray-50 p-6 pb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-900" />
          <h3 className="text-lg font-semibold text-blue-900">Comments</h3>
        </div>
      </div>
      <div className="p-6 pt-2">
        <div className="space-y-4">
          {comments.map((comment) => (
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
