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
import { useCallback, useState } from "react";
import { PDFDocument } from "../MyWorksheets/pdf";
import { pdf } from "@react-pdf/renderer";
import { useSubscription } from "../../hooks/useSubscription";
import { Link, useLocation } from "wouter";
import { useStripeReturn } from "./stripeHook";
import { GET_USER_WORKSHEETS } from "../MyWorksheets/data";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { isReorderModeVar } from "./data";

export default function CreateWorksheet() {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const cartItems = useReactiveVar(cartItemsVar);
  const isReorderMode = useReactiveVar(isReorderModeVar);
  const { hasActiveSubscription, loading: subscriptionStateLoading } =
    useSubscription();

  const toggleReorderMode = () => {
    isReorderModeVar(!isReorderMode);
  };

  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(
    null
  );

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

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      const newCartItems = [...cartItems];

      const [removed] = newCartItems.splice(sourceIndex, 1);
      newCartItems.splice(destinationIndex, 0, removed);

      cartItemsVar(newCartItems);
    },
    [cartItems]
  );

  const unsortedQuestions = q_data?.questions ?? [];
  const questions = cartItems
    .map((id) => unsortedQuestions.find((q) => q.id === id))
    .filter(Boolean);

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

  // Helper function to find hovered question
  const hoveredQuestion = questions.find(
    (q: any) => q.id === hoveredQuestionId
  );

  // A helper function for sorting question images:
  function sortQuestionImages(imgs: any[]) {
    const regex = /Q(\d+)-(\d+)\./;
    return [...imgs].sort((a, b) => {
      const aMatch = a.questionimgname.match(regex);
      const bMatch = b.questionimgname.match(regex);
      if (aMatch && bMatch) {
        return parseInt(aMatch[2]) - parseInt(bMatch[2]);
      }
      return 0;
    });
  }

  // Step 6: Helper function to remove a question from cart
  const removeFromCart = (questionId: string) => {
    const newCartItems = cartItems.filter((id) => id !== questionId);
    cartItemsVar(newCartItems);
  };

  return (
    <div className="mx-8">
      <SubscriptionSuccessModal />
      <div className="flex items-center gap-2 my-4">
        <label htmlFor="reorderModeToggle" className="font-semibold">
          Reorder questions
        </label>
        <input
          id="reorderModeToggle"
          type="checkbox"
          className="toggle toggle-primary"
          checked={isReorderMode}
          onChange={toggleReorderMode}
        />
      </div>

      {isReorderMode ? (
        <div className="flex gap-4">
          <div className="w-1/2 border border-dashed border-gray-400 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="font-bold mb-2">
              Re-order questions (drag and drop)
            </h3>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cartList">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-2"
                  >
                    {questions.map((q, index) => {
                      const sortedImages = sortQuestionImages(
                        q.questionimgs ?? []
                      );
                      const firstImage = sortedImages[0] ?? null;

                      const thumbnailUrl = firstImage
                        ? `${
                            import.meta.env.VITE_BACKEND_API
                          }/images/question/${firstImage.questionimgid}`
                        : null;

                      const topicLabels = q.question_topics?.map(
                        (t) => t.topic.topicname
                      );

                      return (
                        <Draggable key={q.id} draggableId={q.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative border border-gray-300 bg-white shadow-sm p-2 rounded flex gap-2 items-center hover:bg-gray-50"
                              onMouseEnter={() => setHoveredQuestionId(q.id)}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(q.id);
                                }}
                                className="absolute top-1 right-1 text-gray-400 hover:text-gray-700"
                                aria-label="Remove question"
                              >
                                ✕
                              </button>

                              {thumbnailUrl ? (
                                <img
                                  src={thumbnailUrl}
                                  alt="Question Thumbnail"
                                  className="w-20 h-20 object-contain"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500">
                                  No Img
                                </div>
                              )}

                              <div className="flex-1">
                                {topicLabels && topicLabels.length > 0 ? (
                                  <p className="text-sm text-gray-700">
                                    {topicLabels.join(", ")}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    No topics
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="w-1/2 border border-dashed border-gray-400 p-4 sticky top-4 max-h-[calc(100vh-200px)]">
            <h3 className="font-bold mb-2">Question Preview</h3>

            {hoveredQuestion ? (
              <div className="border border-gray-300 bg-white shadow-sm p-2 rounded flex flex-col items-center overflow-y-auto max-h-[calc(100vh-300px)]">
                {sortQuestionImages(hoveredQuestion.questionimgs).map(
                  (img: any) => (
                    <img
                      key={img.questionimgid}
                      src={`${
                        import.meta.env.VITE_BACKEND_API
                      }/images/question/${img.questionimgid}`}
                      alt={img.questionimgname}
                      className="w-full h-auto object-contain my-2"
                    />
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Hover over a question on the left to see a preview
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {questions.map((q) => (
            <Question key={q.id} q={q} isInCart={cartItems.includes(q.id)} />
          ))}

          {q_loading && (
            <span className="loading loading-spinner loading-lg"></span>
          )}
        </div>
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
