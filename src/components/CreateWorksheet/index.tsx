import { useUser } from "@clerk/clerk-react";
import Question from "../Question";
import { twMerge } from "tailwind-merge";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import {
  GET_QUESTIONS_BY_ID,
  cartItemsVar,
  GET_FREE_WORKSHEETS_LEFT,
  DECREMENT_FREE_WORKSHEETS,
  CREATE_WORKSHEET,
  CREATE_WORKSHEET_QUESTIONS,
} from "./data";
import posthog from "posthog-js";
import { useState } from "react";
import { PDFDocument } from "../MyWorksheets/pdf";
import { pdf } from "@react-pdf/renderer";
import { useSubscription } from "../../hooks/useSubscription";
import { Link, useLocation } from "wouter";
import { useStripeReturn } from "./stripeHook";
import { GET_USER_WORKSHEETS } from "../MyWorksheets/data";

export default function CreateWorksheet() {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const cartItems = useReactiveVar(cartItemsVar);
  const { hasActiveSubscription, loading: subscriptionStateLoading } =
    useSubscription();

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

  // Query for number of free worksheets left
  const { data: freeWorksheetsData } = useQuery(GET_FREE_WORKSHEETS_LEFT, {
    variables: { userid: user?.id || "" },
    skip: !user?.id,
  });

  // Mutation for decrementing free worksheets
  const [decrementFreeWorksheets] = useMutation(DECREMENT_FREE_WORKSHEETS, {
    refetchQueries: [GET_FREE_WORKSHEETS_LEFT],
    variables: { userid: user?.id || "" },
  });

  const [createWorksheet] = useMutation(CREATE_WORKSHEET, {
    refetchQueries: [GET_USER_WORKSHEETS],
  });
  const [createWorksheetQuestions] = useMutation(CREATE_WORKSHEET_QUESTIONS, {
    refetchQueries: [GET_USER_WORKSHEETS],
  });

  const questions = q_data?.questions || [];
  console.log(questions);

  const freeWorksheetsLeft =
    freeWorksheetsData?.users[0]?.free_worksheets_count || 0;

  const [downloadLoading, setDownloadLoading] = useState(false);

  async function downloadPDF() {
    const cartItems = cartItemsVar();
    const questions = cartItems.map((id) => {
      return q_data?.questions.find((q) => q.id === id);
    });

    if (questions.length === 0) {
      return;
    }

    const doc = <PDFDocument questionsData={{ questions }} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    newTab.focus();
  }

  const handleDownload = async () => {
    if (!user?.id) return;

    try {
      setDownloadLoading(true);

      // First create the worksheet
      const { data: worksheetData } = await createWorksheet({
        variables: {
          name: `Worksheet ${new Date().toLocaleDateString()}`,
          creator: user.id,
        },
      });

      // Then create the worksheet-question relationships
      if (worksheetData?.insert_worksheets_one?.id) {
        await createWorksheetQuestions({
          variables: {
            objects: cartItems.map((questionId: string) => ({
              worksheet_id: worksheetData.insert_worksheets_one.id,
              question_id: questionId,
            })),
          },
          refetchQueries: [
            {
              query: GET_USER_WORKSHEETS,
              variables: { userid: user.id },
            },
          ],
        });
      }

      await downloadPDF();
      if (freeWorksheetsLeft > 0) {
        await decrementFreeWorksheets({ variables: { userid: user.id } });
      }

      posthog.capture("user_downloaded_free_worksheet");
      cartItemsVar([]);
      // Switch to the MyWorksheets page
      setLocation("/worksheets");
    } catch (error) {
      console.error("There was a problem with the download:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="mx-8">
      <SubscriptionSuccessModal />
      <div className="flex flex-col gap-8">
        {questions.map((q) => (
          <Question key={q.id} q={q} isInCart={cartItems.includes(q.id)} />
        ))}
      </div>

      {q_loading && (
        <span className="loading loading-spinner loading-lg"></span>
      )}

      <div className="flex flex-row items-end gap-4 fixed bottom-4 right-4 z-10">
        <div
          onClick={() => {
            cartItemsVar([]);
          }}
          className="btn btn-neutral btn-lg"
        >
          Clear questions
        </div>
        {freeWorksheetsLeft > 0 ? (
          <div className="flex flex-col">
            <div>({freeWorksheetsLeft} free downloads left)</div>
            <button
              onClick={handleDownload}
              className={twMerge(
                "btn btn-primary btn-lg w-56",
                cartItems.length === 0 && "btn-disabled"
              )}
            >
              {downloadLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Download"
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!subscriptionStateLoading && hasActiveSubscription) {
                handleDownload();
              }
            }}
            disabled={subscriptionStateLoading}
            className={twMerge(
              "btn btn-neutral btn-lg w-56",
              !hasActiveSubscription && "btn-outline "
            )}
          >
            {subscriptionStateLoading || downloadLoading ? (
              <span className="loading loading-spinner"></span>
            ) : hasActiveSubscription ? (
              "Create worksheet"
            ) : (
              <Link href="/subscribe">Subscribe to create worksheet</Link>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SubscriptionSuccessModal() {
  const { showSuccessModal, setShowSuccessModal } = useStripeReturn();
  return (
    <div className={`modal ${showSuccessModal ? "modal-open" : ""}`}>
      <div className="modal-box text-center">
        <h3 className="text-2xl font-bold mb-4">Subscription Successful!</h3>
        <p className="mb-4">Thank you for subscribing to Teebloc</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowSuccessModal(false)}
        >
          Continue
        </button>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={() => setShowSuccessModal(false)}
      >
        <button>close</button>
      </form>
    </div>
  );
}
