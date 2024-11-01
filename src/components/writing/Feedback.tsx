import React, { useState, useEffect } from "react";
import { Composition } from "./Composition";
import { CommentPanel } from "./CommentPanel";

export default function Feedback({ id }: { id: string }) {
  // Load the comments from the JSON file with the given id
  const [data, setData] = useState<any>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);

  useEffect(() => {
    // Dynamic import
    import(`./data/${id}.json`)
      .then((module) => {
        setData(module.default);
      })
      .catch((error) => {
        console.error("Error loading comments:", error);
      });
  }, [id]);

  return (
    <div className="flex h-screen">
      {data && (
        <>
          <Composition
            compo={data.compo}
            comments={data.comments}
            onHighlightClick={setActiveComment}
            activeComment={activeComment}
            activeParagraph={activeParagraph}
            onParagraphClick={setActiveParagraph}
          />
          <CommentPanel
            comments={data.comments}
            activeComment={activeComment}
            activeParagraph={activeParagraph}
            onCommentClick={setActiveComment}
          />
        </>
      )}
    </div>
  );
}
