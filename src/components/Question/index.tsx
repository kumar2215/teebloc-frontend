import { cartItemsVar } from "../CreateWorksheet/data";
import { useReactiveVar } from "@apollo/client";
import { QuestionType } from "../Questions";
import { memo } from "react";
import posthog from "posthog-js";
import { Link } from "wouter";

function sortQuestionImages(questionimgs: QuestionType["questionimgs"]) {
  const copiedQuestionImages = JSON.parse(JSON.stringify(questionimgs));
  return copiedQuestionImages.sort((a, b) => {
    const regex = /Q(\d+)-(\d+)\./;

    // Question number can be 23 or 45-1 or 45-2, etc
    const aMatch = a.questionimgname.match(regex);
    const bMatch = b.questionimgname.match(regex);

    if (aMatch && bMatch) {
      return aMatch[2] - bMatch[2];
    } else {
      return 0;
    }
  });
}

const Question = memo(function Question({
  q,
  isInCart,
  worksheets = [],
}: {
  q: QuestionType;
  isInCart: boolean;
  worksheets?: { id: number; name: string }[];
}) {
  return (
    <div
      key={q.id}
      className="card bg-base-100 shadow-xl w-3/5 min-w-96 border-dashed border-2 border-sky-500 bg-sky-100"
    >
      {sortQuestionImages(q.questionimgs).map((qi) => {
        return (
          <figure key={qi.questionimgid}>
            <img
              src={`${import.meta.env.VITE_BACKEND_API}/images/question/${
                qi.questionimgid
              }`}
              className="w-full"
              alt={qi.questionimgname}
            />
          </figure>
        );
      })}

      <div className="card-body">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
          <div className="text-gray-600">Level:</div>
          <div>{q.level.level}</div>
          <div className="text-gray-600">Paper:</div>
          <div>{q.paper.paper}</div>
          <div className="text-gray-600">Assessment:</div>
          <div>{q.assessment.assessmentname}</div>
          <div className="text-gray-600">School:</div>
          <div>{q.school.schoolname}</div>
        </div>

        <div className="text-gray-600 mt-2">Topics:</div>
        {q.question_topics.map((qt) => {
          return (
            <div
              key={qt.topic.topicname}
              className="badge badge-outline inline"
            >
              {qt.topic.topicname}
            </div>
          );
        })}

        {worksheets.length > 0 && (
          <div className="mt-2 text-sm text-gray-700">
            This question was used in:{" "}
            {worksheets.map((ws, index) => (
              <span key={ws.id}>
                <Link
                  href={`/worksheets?highlight=${ws.id}`}
                  className="text-blue-500 underline"
                >
                  {ws.name}
                </Link>
                {index < worksheets.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-end">
          {isInCart ? (
            // {cartItems.includes(q.id) ? (
            <button
              onClick={
                () => cartItemsVar(cartItemsVar().filter((id) => id !== q.id))
                //   cartItemsVar(cartItems.filter((id) => id !== q.id))
              }
              className="btn"
            >
              Remove from worksheet
            </button>
          ) : (
            <button
              onClick={() => {
                cartItemsVar([...cartItemsVar(), q.id]);
                posthog.capture("question_added_to_worksheet", {
                  questionId: q.id,
                  topicNames: q.question_topics.map((qt) => qt.topic.topicname),
                });
              }}
              className="btn btn-primary"
            >
              Add to worksheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Question;
