import { useState } from "react";
import { GetQuestionsQuery } from "../../__generated__/graphql";

async function generateHTML(questionsData) {
  const questions = JSON.parse(JSON.stringify(questionsData.questions));
  const sortedByPaper = questions.sort((a, b) => {
    return parseInt(a.paper.paper) - parseInt(b.paper.paper);
  });

  // Start building the HTML content
  let htmlContent =
    "<!DOCTYPE html><html><head><title>Images</title></head><body>";

  // Add question images
  for (const [questionIndex, question] of sortedByPaper.entries()) {
    const questionImages = question.questionimgs.sort((a, b) => {
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

    for (const [index, questionImage] of questionImages.entries()) {
      const isBreak =
        questionImages.length === 1 ||
        (questionImages.length > 1 && index === questionImages.length - 1);
      htmlContent += `<div style="display:flex;width:100%;justify-content:space-between;${
        isBreak ? "border-bottom:black solid" : ""
      }"><div style="font-size: 45px;text-wrap:nowrap">${
        index === 0 ? questionIndex + 1 : ""
      }</div><img src="${`${import.meta.env.VITE_BACKEND_API}/images/question/${
        questionImage.questionimgid
      }`}" alt="Question Image ${
        index + 1
      }" style="width:70%;margin-right:15%;margin-left:15%"><div style="font-size: 45px;text-wrap:nowrap;color:transparent">${
        index === 0 ? questionIndex + 1 : ""
      }</div></div>`;
    }
  }

  // htmlContent += "<div style='display: flex'>";
  // Add answer images (very similar to questions)
  for (const [questionIndex, question] of sortedByPaper.entries()) {
    const answerImages = question.answerimgs.sort((a, b) => {
      const regex = /Q(\d+)-(\d+)\./;

      // Question number can be 23 or 45-1 or 45-2, etc
      const aMatch = a.answerimgname.match(regex);
      const bMatch = b.answerimgname.match(regex);

      if (aMatch && bMatch) {
        return aMatch[2] - bMatch[2];
      } else {
        return 0;
      }
    });

    for (const [index, answerImage] of answerImages.entries()) {
      htmlContent += `<div style="display:flex"><div style="font-size: 30px;margin-right:30px">${
        questionIndex + 1
      }</div><img src="${`${import.meta.env.VITE_BACKEND_API}/images/answer/${
        answerImage.answerimgid
      }`}" alt="Answer Image ${index + 1}" style="display:block;width:${
        question.paper.paper === 1 ? "10%" : "70%"
      };${
        question.paper.paper === 2 && "margin-right:15%;margin-left:15%"
      };margin-bottom:20px"></div>`;
    }
  }
  // Close the HTML content
  // htmlContent += "</body></html>";

  // Write the HTML content to the new window or iframe
  const newWindow = window.open("", "_blank");
  newWindow.document.write(htmlContent);
  newWindow.document.close();
}

export function useGenerateWorksheet() {
  const [loading, setLoading] = useState(false);

  async function generateWorksheet(
    questionsData: GetQuestionsQuery | undefined,
  ) {
    console.log("Question data in hook: ", questionsData);
    if (!questionsData) return;
    console.log("CLICKED 3");
    setLoading(true);
    await generateHTML(questionsData);
    // 5s timeout
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    setLoading(false);
  }

  return { loading, generateWorksheet };
}
