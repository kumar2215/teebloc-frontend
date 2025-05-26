import {
  GetQuestionsQuery,
  GetQuestionsByIdQuery,
} from "../../__generated__/graphql";
import Question from "../Question";
import { cartItemsVar } from "../CreateWorksheet/data";
import { useReactiveVar } from "@apollo/client";

export type QuestionType = GetQuestionsQuery["questions"][0];
export type QuestionByIdType = GetQuestionsByIdQuery["questions"][0];

export default function Questions({
  questions,
  loading,
  onLoadMore,
  worksheetsMapping = {},
}: {
  questions: QuestionType[] | QuestionByIdType[];
  loading: boolean;
  onLoadMore: () => void;
  worksheetsMapping?: { [key: string]: { id: number; name: string }[] };
}) {
  const cartItems = useReactiveVar(cartItemsVar);
  return (
    <>
      <div className="flex flex-col gap-8">
        {questions.map((q) => (
          <Question
            key={q.id}
            q={q}
            isInCart={cartItems.includes(q.id)}
            worksheets={worksheetsMapping[q.id] || []}
          />
        ))}
      </div>
      {questions.length > 0 && (
        <button
          className="mb-16 btn btn-primary"
          onClick={onLoadMore}
          type="button"
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner"></span>}
          {loading ? "Loading" : "Load more"}
        </button>
      )}
    </>
  );
}
