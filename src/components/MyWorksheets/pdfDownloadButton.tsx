import { wrap } from "comlink";
import { GET_QUESTIONS_BY_ID } from "../Cart/data";
import Worker from "../../workers/pdf.worker?worker";
import { useState } from "react";
import { useLazyQuestionsQuery } from "./helpers";

/**
 * A top-level component that handles dispatching the PDF job to the worker.
 * This component manages its own worker instance.
 */
export default function PDFDownloadButton({
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
