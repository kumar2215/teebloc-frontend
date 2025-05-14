import { useMutation } from "@apollo/client";
import { useState } from "react";
import { DELETE_WORKSHEET_AND_RELATIONS } from "./data";

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
 * Custom hook to handle deleting a worksheet along with its related join table entries.
 *
 * @param refetchWorksheets - Function to refetch worksheets after deletion.
 */
export function useDeleteWorksheet(refetchWorksheets: () => void) {
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
