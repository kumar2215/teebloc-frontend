import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import Feedback from "./Feedback";

export default function Writing() {
  const [file, setFile] = useState<File | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamedSuggestion, setStreamedSuggestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const streamRef = useRef<EventSource | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file");
      event.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadingFile(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/pdf", {
        method: "POST",
        body: formData,
      });

      if (response.body) {
        setIsStreaming(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value);
            console.log("Received chunk:", chunk);
            // Chunk is in this format: data: {'event': 'pdf_processed', 'num_pages': 5}
            // const parsedChunk = JSON.parse(chunk.split("data: ")[1]);
            // console.log("Parsed chunk:", parsedChunk);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            lines.forEach((line) => {
              try {
                const parsedData = JSON.parse(line);
                handleParsedData(parsedData);
              } catch (error) {
                console.error("Error parsing chunk:", error);
              }
            });

            // setStreamedText((prevText) => prevText + chunk);
          }
        }
      }

      // if (response.ok) {
      //   // const { id } = await response.json();
      //   startStreaming();
      // } else {
      //   console.error("Upload failed");
      // }
    } catch (error) {
      console.error("Error during upload:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleParsedData = (parsedData: any) => {
    switch (parsedData.event) {
      case "text_extracted":
        setStreamedText((prevText) => prevText + parsedData.chunk);
        break;
      case "suggestion":
        setStreamedSuggestion(
          (prevSuggestion) => prevSuggestion + parsedData.chunk
        );
        break;
      // Add more cases for other event types as needed
      default:
        console.log("Unknown event:", parsedData.event);
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
    setStreamedText("");

    streamRef.current = new EventSource("http://localhost:8000/pdf");

    streamRef.current.onmessage = (event) => {
      setStreamedText((prev) => prev + event.data);
    };

    streamRef.current.onerror = (error) => {
      console.error("EventSource failed:", error);
      stopStreaming();
    };
  };

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.close();
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  return (
    <div className="mx-8 mb-8 flex gap-8 flex-col">
      <div className="flex flex-col gap-2">
        <div className="text-xl">Upload a PDF of your essay.</div>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploadingFile || isStreaming}
          className="btn btn-primary mt-2 w-fit"
        >
          {uploadingFile ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Upload and Mark"
          )}
        </button>
      </div>
      <Feedback />
      {isStreaming && (
        <div className="mt-4">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col flex-1">
              <h2 className="text-lg font-semibold">Original Essay:</h2>
              <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
                {streamedText}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-lg font-semibold">Suggestions:</h2>
              <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
                {streamedSuggestion}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
