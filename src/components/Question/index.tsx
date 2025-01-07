import { cartItemsVar } from "../CreateWorksheet/data";
import { useReactiveVar } from "@apollo/client";
import { QuestionType } from "../Questions";
import { memo } from "react";
import posthog from "posthog-js";

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
}: {
  q: QuestionType;
  isInCart: boolean;
}) {
  // const cartItems = useReactiveVar(cartItemsVar);
  // console.log("cartItems", cartItems);
  return (
    <div
      key={q.id}
      className="card bg-base-100 shadow-xl w-3/5 min-w-96 border-dashed border-2 border-sky-500 bg-sky-100"
    >
      {sortQuestionImages(q.questionimgs).map((qi) => {
        return (
          <figure>
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
        {/* <div className="badge badge-outline">
                {q.assessment.assessmentname}
              </div> */}
        {/* <div className="badge badge-outline">{q.level.level}</div>
              <div className="badge badge-outline">{q.paper.paper}</div>
              <div className="badge badge-outline">{q.school.schoolname}</div> */}
        {q.question_topics.map((qt) => {
          return (
            <div className="badge badge-outline inline">
              {qt.topic.topicname}
            </div>
          );
        })}
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
