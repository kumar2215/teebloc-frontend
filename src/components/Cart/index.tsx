import { useUser } from "@clerk/clerk-react";
import Question from "../Question";
import { useQuery, useReactiveVar } from "@apollo/client";
import { GET_QUESTIONS_BY_ID, cartItemsVar } from "./data";
import posthog from "posthog-js";

export default function Cart() {
  const { user } = useUser();
  const cartItems = useReactiveVar(cartItemsVar);

  const {
    loading: q_loading,
    error: q_error,
    data: q_data,
  } = useQuery(GET_QUESTIONS_BY_ID, {
    fetchPolicy: "cache-and-network",
    variables: {
      ids: cartItems,
    },
  });

  const questions = q_data?.questions || [];

  const paper1Questions = questions.filter((q) => q.paper.paper === 1);

  const totalPrice =
    paper1Questions.length * 0.05 +
    (cartItems.length - paper1Questions.length) * 0.1;

  const handleCheckout = async () => {
    posthog.capture("user_clicked_checkout");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_ids: cartItems,
            num_paper1_questions: paper1Questions.length,
            user_id: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const session = await response.json();
      // Redirect to the URL provided by the response
      window.location.href = session.url;
    } catch (error) {
      console.error("There was a problem with the checkout:", error);
    }
  };

  return (
    <div className="mx-8">
      <div className="flex flex-col gap-8">
        {questions.map((q) => (
          <Question key={q.id} q={q} isInCart={cartItems.includes(q.id)} />
        ))}
      </div>

      {q_loading && (
        <span className="loading loading-spinner loading-lg"></span>
      )}

      <div
        onClick={handleCheckout}
        className="btn btn-neutral btn-lg w-56 fixed bottom-4 right-4 z-10"
      >
        Checkout
      </div>
    </div>
  );
}
