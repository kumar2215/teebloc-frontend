import React, { useState, useEffect } from "react";
import { Composition } from "./Composition";
import { CommentPanel } from "./CommentPanel";

export default function Feedback({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"language" | "content">(
    "language"
  );

  useEffect(() => {
    import(`./data/${id}.json`)
      .then((module) => {
        console.log(module.default);
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
            comments={[...data.languageComments, ...data.contentComments]}
            onHighlightClick={setActiveComment}
            activeComment={activeComment}
            activeParagraph={activeParagraph}
            onParagraphClick={setActiveParagraph}
            activeTab={activeTab}
          />
          <CommentPanel
            languageComments={data.languageComments}
            contentComments={data.contentComments}
            activeComment={activeComment}
            activeParagraph={activeParagraph}
            onCommentClick={setActiveComment}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
    </div>
  );
}
