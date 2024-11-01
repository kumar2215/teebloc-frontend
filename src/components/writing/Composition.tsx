import React from "react";
import { Highlight } from "./Highlight";
import type { Comment } from "./types/Comment";

interface CompositionProps {
  compo: string;
  comments: Comment[];
  onHighlightClick: (id: string) => void;
  activeComment: string | null;
  activeParagraph: number | null;
  onParagraphClick: (paragraphId: number) => void;
}

export const Composition: React.FC<CompositionProps> = ({
  compo,
  comments,
  onHighlightClick,
  activeComment,
  activeParagraph,
  onParagraphClick,
}) => {
  // Split the composition into paragraphs
  const paragraphs = compo.split("\n\n");

  const renderParagraphContent = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const highlightRegex = /\[\[(.*?)\|(\d+)\]\]/g;
    let match;

    while ((match = highlightRegex.exec(text)) !== null) {
      // Add text before the highlight
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the highlight component
      const [_, content, commentId] = match;
      const comment = comments.find((c) => c.id === commentId);

      if (comment) {
        parts.push(
          <Highlight
            key={`${commentId}-${match.index}`}
            commentId={commentId}
            colorClass={comment.colorClass}
            onClick={onHighlightClick}
            isActive={activeComment === commentId}
          >
            {content}
          </Highlight>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const handleParagraphClick = (paragraphId: number) => {
    onParagraphClick(paragraphId);

    // Wait for collapse transitions to complete (200ms as per CSS)
    setTimeout(() => {
      const commentsPanel = document.querySelector(".comments-panel");
      const header = document.querySelector(".comments-header");
      const commentElement = document.querySelector(
        `[data-paragraph-id="${paragraphId}"]`
      );

      if (commentsPanel && header && commentElement) {
        const headerHeight = header.getBoundingClientRect().height;
        const commentOffsetTop =
          commentElement.getBoundingClientRect().top -
          commentsPanel.getBoundingClientRect().top;
        const scrollOffset = commentOffsetTop - headerHeight - 16; // Added padding

        commentsPanel.scrollTo({
          top: commentsPanel.scrollTop + scrollOffset,
          behavior: "smooth",
        });
      }
    }, 305); // Slightly longer than the transition duration to ensure completion
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white p-8">
      <h2 className="mb-6 text-2xl font-bold text-blue-900">
        Student's Composition
      </h2>

      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            onClick={() => handleParagraphClick(index + 1)}
            className={`text-gray-700 p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeParagraph === index + 1
                ? "bg-blue-50 ring-2 ring-blue-200"
                : "hover:bg-gray-50"
            }`}
          >
            {renderParagraphContent(paragraph)}
          </p>
        ))}

        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-blue-900">
            General Comments:
          </h3>
          <div className="space-y-3">
            <p>
              <strong>Vary Sentence Beginnings:</strong> Avoid starting multiple
              sentences with "Tom" to enhance readability.
            </p>
            <p>
              <strong>Consistent Tense Usage:</strong> Ensure past tense is used
              consistently throughout the composition.
            </p>
            <p>
              <strong>Avoid Repetition:</strong> Use synonyms or rephrase
              sentences to prevent repetitive language.
            </p>
            <p>
              <strong>Clarity and Precision:</strong> Use clear and precise
              language to convey ideas effectively.
            </p>
            <p>
              <strong>Proofreading:</strong> Check for grammatical errors and
              punctuation issues to improve overall quality.
            </p>
          </div>

          <h3 className="mb-4 mt-6 text-xl font-semibold text-blue-900">
            Overall Assessment:
          </h3>
          <p className="text-gray-700">
            The composition effectively narrates Tom's journey of determination
            and resourcefulness in achieving his goal. By applying the suggested
            improvements, the story will become even more compelling and
            polished. Excellent effort in crafting a meaningful tale that
            illustrates the value of hard work and perseverance!
          </p>
        </div>
      </div>
    </div>
  );
};
