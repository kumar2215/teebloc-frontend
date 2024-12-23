import { useApolloClient, useQuery, useMutation } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { pdf } from "@react-pdf/renderer";
import qs from "qs";
import { useCallback, useEffect, useState } from "react";
import { useSearch } from "wouter";
import { GET_QUESTIONS_BY_ID, cartItemsVar } from "../Cart/data";
import { GET_USER_WORKSHEETS, UPDATE_WORKSHEET_NAME } from "./data";
import { PDFDocument } from "./pdf";
import posthog from "posthog-js";

async function useLazyQuestionsQuery(
  client,
  query,
  variables,
  expectedNumQuestions
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

export default function MyWorksheets() {
  const client = useApolloClient();
  const { user } = useUser();
  const searchParams = useSearch();

  // Clear cart after successful checkout
  useEffect(() => {
    const existingQueries = qs.parse(searchParams, {
      ignoreQueryPrefix: true,
    });
    if (existingQueries && existingQueries.success === "true") {
      cartItemsVar([]);
    }
  }, [searchParams]);

  const [worksheetLoading, setWorksheetLoading] = useState({});
  const [editingWorksheetId, setEditingWorksheetId] = useState(null);
  const [newWorksheetName, setNewWorksheetName] = useState("");
  const [saving, setSaving] = useState(false);

  const [updateWorksheetName] = useMutation(UPDATE_WORKSHEET_NAME);

  const handleEditName = (worksheetId, currentName) => {
    setEditingWorksheetId(worksheetId);
    setNewWorksheetName(currentName);
  };

  const handleSaveName = (worksheetId) => {
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

  const {
    loading: w_loading,
    error: w_error,
    data: w_data,
  } = useQuery(GET_USER_WORKSHEETS, {
    variables: {
      userid: user.id,
    },
  });

  // Might not beed to use useCallback here
  const handleGetPDF = useCallback(
    (worksheet) => {
      setWorksheetLoading((prev) => ({ ...prev, [worksheet.id]: true }));

      useLazyQuestionsQuery(
        client,
        GET_QUESTIONS_BY_ID,
        {
          ids: worksheet.worksheets_to_questions.map((wtq) => wtq.question_id),
        },
        worksheet.worksheets_to_questions.length
      )
        .then((result) => {
          console.log("GOT data!");
          if (result.data) {
            const ids = result.data.questions.map((q) => {
              return q.id;
            });

            const doc = <PDFDocument questionsData={result.data} />;
            const asPdf = pdf(doc);
            return asPdf.toBlob();
          }
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const newTab = window.open(url, "_blank");
          newTab.focus();

          setWorksheetLoading((prev) => ({ ...prev, [worksheet.id]: false }));
        });
    },
    [setWorksheetLoading]
  );

  const worksheets = w_data?.worksheets || [];
  const sortedWorksheets = [...worksheets].sort((a, b) => {
    return new Date(b.created) - new Date(a.created);
  });

  return (
    <>
      <div className="mx-8 flex flex-col gap-8">
        {w_loading && (
          <span className="loading loading-spinner loading-lg"></span>
        )}
        {/* Sort worksheets by created date */}
        {sortedWorksheets.map((w) => (
          <div className="card bg-base-100 shadow-xl border-dashed border-2 border-sky-500 bg-sky-100">
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
              <p>{w.worksheets_to_questions.length} questions</p>
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
                <button
                  className="btn btn-primary"
                  disabled={worksheetLoading[w.id]}
                  onClick={() => {
                    console.log("Worksheet clicked", w);
                    handleGetPDF(w);
                  }}
                >
                  {worksheetLoading[w.id] && (
                    <span className="loading loading-spinner"></span>
                  )}
                  {worksheetLoading[w.id] ? "Loading" : "Get PDF"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
