import { useApolloClient, useQuery, useMutation } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { pdf } from "@react-pdf/renderer";
import qs from "qs";
import { useCallback, useEffect, useState, useRef } from "react";
import { wrap } from "comlink";
import { GET_QUESTIONS_BY_ID } from "../Cart/data";
import {
  GET_USER_WORKSHEETS,
  UPDATE_WORKSHEET_NAME,
  DELETE_WORKSHEET_AND_RELATIONS,
} from "./data";
import { PDFDocument } from "./pdf";
import posthog from "posthog-js";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import Worker from "../../workers/pdf.worker?worker";
import { useSearchParams } from "wouter-search";

/**
 * Helper function to fetch questions data for a worksheet.
 */
export async function useLazyQuestionsQuery(
  client: any,
  query: any,
  variables: any,
  expectedNumQuestions: number
) {
  const response = await client.query({
    query,
    variables,
  });
  const { data } = response;
  const questions = data?.questions;
  if (questions?.length === expectedNumQuestions) {
    return response;
  } else {
    return client.query({
      query,
      variables,
      fetchPolicy: "network-only",
    });
  }
}

/**
 * A top-level component that handles dispatching the PDF job to the worker.
 * This component manages its own worker instance.
 */
export function PDFDownloadButton({
  worksheet,
  client,
}: {
  worksheet: any;
  client: any;
}) {
  const [loading, setLoading] = useState(false);
  const [questionsOnlyLoading, setQuestionsOnlyLoading] = useState(false);

  const handleDownload = async (questionsOnly = false) => {
    if (questionsOnly) {
      setQuestionsOnlyLoading(true);
    } else {
      setLoading(true);
    }

    let worker: Worker | null = null;
    try {
      const result = await useLazyQuestionsQuery(
        client,
        GET_QUESTIONS_BY_ID,
        {
          ids: worksheet.worksheets_to_questions.map(
            (wtq: any) => wtq.question_id
          ),
        },
        worksheet.worksheets_to_questions.length
      );
      if (result.data) {
        // Instantiate a new worker for this download
        worker = new Worker();
        const pdfWorker = wrap(worker);
        // Pass questionsOnly parameter to the worker
        const url: string = await pdfWorker.renderPDF(
          result.data,
          questionsOnly
        );

        const pdfWindow = window.open(url, "_blank");
        pdfWindow?.focus();
        if (pdfWindow) {
          const interval = setInterval(() => {
            if (pdfWindow.closed) {
              // Terminate the worker once the new tab (PDF preview) is closed.
              worker?.terminate();
              clearInterval(interval);
              console.log("Worker terminated as PDF tab has been closed.");
            }
          }, 1000); // Check every second; adjust as necessary.
        } else {
          console.error("Failed to open the PDF tab.");
          // Terminate the worker if you can't show the PDF.
          worker.terminate();
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      if (questionsOnly) {
        setQuestionsOnlyLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        className="btn btn-primary"
        onClick={() => handleDownload(false)}
        disabled={loading || questionsOnlyLoading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span> Loading
          </>
        ) : (
          "Get PDF"
        )}
      </button>
      <button
        className="btn btn-primary"
        onClick={() => handleDownload(true)}
        disabled={loading || questionsOnlyLoading}
      >
        {questionsOnlyLoading ? (
          <>
            <span className="loading loading-spinner"></span> Loading
          </>
        ) : (
          "Get PDF without answer sheet"
        )}
      </button>
    </div>
  );
}

export default function MyWorksheets() {
  const client = useApolloClient();
  const { user } = useUser();
  const isAdmin = useIsAdmin();

  const [editingWorksheetId, setEditingWorksheetId] = useState<number | null>(
    null
  );
  const [newWorksheetName, setNewWorksheetName] = useState("");
  const [saving, setSaving] = useState(false);

  // Admin: allow viewing another user's worksheets.
  const [worksheetUserId, setWorksheetUserId] = useState(user?.id || "");
  const [userIdInput, setUserIdInput] = useState(user?.id || "");

  const [updateWorksheetName] = useMutation(UPDATE_WORKSHEET_NAME);

  const {
    loading: w_loading,
    error: w_error,
    data: w_data,
    refetch: refetchWorksheets,
  } = useQuery(GET_USER_WORKSHEETS, {
    variables: {
      userid: worksheetUserId,
    },
  });

  // Use the custom delete hook for worksheets.
  const { deleteWorksheetById, deletingWorksheet } =
    useDeleteWorksheet(refetchWorksheets);

  const handleEditName = (worksheetId: number, currentName: string) => {
    setEditingWorksheetId(worksheetId);
    setNewWorksheetName(currentName);
  };

  const handleSaveName = (worksheetId: number) => {
    setSaving(true);
    updateWorksheetName({
      variables: {
        id: worksheetId,
        newName: newWorksheetName,
      },
    })
      .then(() => {
        setEditingWorksheetId(null);
      })
      .catch((error) => {
        console.error("Error updating worksheet name:", error);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const worksheets = w_data?.worksheets || [];
  const sortedWorksheets = [...worksheets].sort((a, b) => {
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  // Highlight logic using wouter's useSearch
  const [searchParams] = useSearchParams();
  const highlightWorksheetId = searchParams.get("highlight")
    ? parseInt(searchParams.get("highlight")!, 10)
    : null;
  const [highlightActive, setHighlightActive] = useState(false);

  // Only trigger the highlight effect after data has loaded
  useEffect(() => {
    if (!w_loading && w_data && highlightWorksheetId) {
      // Check if the worksheet exists in the loaded data
      const worksheetExists = w_data.worksheets.some(
        (w: any) => w.id === highlightWorksheetId
      );

      if (worksheetExists) {
        setHighlightActive(true);
        const element = document.getElementById(
          `worksheet-${highlightWorksheetId}`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Remove the highlight after 3 seconds
          setTimeout(() => {
            setHighlightActive(false);
          }, 3000);
        }
      }
    }
  }, [w_loading, w_data, highlightWorksheetId]);

  return (
    <>
      <div className="mx-8 flex flex-col gap-8">
        {/* Admin-only UI: Filter worksheets by user id */}
        {isAdmin && (
          <div className="admin-filter flex gap-2 items-center">
            <input
              type="text"
              className="input"
              placeholder="Enter user ID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setWorksheetUserId(userIdInput)}
            >
              Load Worksheets
            </button>
          </div>
        )}

        {w_loading && (
          <span className="loading loading-spinner loading-lg"></span>
        )}
        {w_error && <p>Error loading worksheets: {w_error.message}</p>}
        {sortedWorksheets.map((w: any) => {
          // Determine if this worksheet should be highlighted.
          const isHighlighted =
            highlightActive && highlightWorksheetId === w.id;
          const levels = new Set<string>();
          const assessments = new Set<string>();
          const topics = new Set<string>();

          w.worksheets_to_questions.forEach((wtq: any) => {
            wtq.question.question_topics.forEach((qt: any) =>
              topics.add(qt.topic.topicname)
            );
            levels.add(wtq.question.level.level);
            assessments.add(wtq.question.assessment.assessmentname);
          });

          return (
            <div
              key={w.id}
              id={`worksheet-${w.id}`}
              className={`card bg-base-100 shadow-xl border-dashed ${
                isHighlighted
                  ? "border-2 border-red-500 animate-[pulse_0.5s_ease-in-out_infinite]"
                  : "border-2 border-sky-500"
              } bg-sky-100`}
            >
              <div className="card-body">
                {editingWorksheetId === w.id ? (
                  <input
                    type="text"
                    value={newWorksheetName}
                    onChange={(e) => setNewWorksheetName(e.target.value)}
                    className="input"
                  />
                ) : (
                  <h2 className="card-title">{w.name}</h2>
                )}
                <p className="text-sm text-gray-500">
                  Created on: {new Date(w.created).toLocaleDateString()}
                </p>
                <p>{w.worksheets_to_questions.length} questions</p>
                <div className="flex flex-wrap gap-2">
                  {[...levels].map((level) => (
                    <span
                      key={level}
                      className="badge bg-blue-200 text-blue-800"
                    >
                      {level}
                    </span>
                  ))}
                  {[...assessments].map((assessment) => (
                    <span
                      key={assessment}
                      className="badge bg-green-200 text-green-800"
                    >
                      {assessment}
                    </span>
                  ))}
                  {[...topics].map((topic) => (
                    <span
                      key={topic}
                      className="badge bg-yellow-200 text-yellow-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="card-actions justify-end">
                  {editingWorksheetId === w.id ? (
                    <button
                      className="btn btn-success"
                      onClick={() => handleSaveName(w.id)}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditName(w.id, w.name)}
                    >
                      Edit name
                    </button>
                  )}
                  <PDFDownloadButton worksheet={w} client={client} />
                  {isAdmin && (
                    <button
                      className="btn btn-error"
                      disabled={deletingWorksheet[w.id]}
                      onClick={() => deleteWorksheetById(w.id)}
                    >
                      {deletingWorksheet[w.id] ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Delete Worksheet"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/**
 * Custom hook to handle deleting a worksheet along with its related join table entries.
 *
 * @param refetchWorksheets - Function to refetch worksheets after deletion.
 */
function useDeleteWorksheet(refetchWorksheets: () => void) {
  const [deleteWorksheetMutation] = useMutation(DELETE_WORKSHEET_AND_RELATIONS);
  const [deletingWorksheet, setDeletingWorksheet] = useState<
    Record<number, boolean>
  >({});

  const deleteWorksheetById = (worksheetId: number) => {
    if (!window.confirm("Are you sure you want to delete this worksheet?")) {
      return;
    }
    setDeletingWorksheet((prev) => ({ ...prev, [worksheetId]: true }));
    deleteWorksheetMutation({
      variables: { id: worksheetId },
    })
      .then(() => {
        refetchWorksheets();
      })
      .catch((error) => {
        console.error("Error deleting worksheet:", error);
      })
      .finally(() => {
        setDeletingWorksheet((prev) => ({ ...prev, [worksheetId]: false }));
      });
  };

  return { deleteWorksheetById, deletingWorksheet };
}
