import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import posthog from "posthog-js";

export function useSurvey() {
  const { isSignedIn } = useUser();

  const SURVEY_ID = import.meta.env.VITE_USER_ROLE_SURVEY_ID;
  const SURVEY_QUESTION_ID = import.meta.env.VITE_USER_ROLE_SURVEY_QUESTION_ID;

  const [showSurvey, setShowSurvey] = useState(false);
  const [hasDoneSurvey, setHasDoneSurvey] = useState(
    () =>
      localStorage.getItem(`hasInteractedWithSurvey_${SURVEY_ID}`) === "true"
  );

  const onSurveySubmit = (role: string, isNoResponse = false) => {
    // Update state and local storage to prevent showing the survey again
    setHasDoneSurvey(true);
    localStorage.setItem(`hasInteractedWithSurvey_${SURVEY_ID}`, "true");

    // Capture the response in PostHog
    const responseKey = `$survey_response_${SURVEY_QUESTION_ID}`;
    posthog.capture("survey sent", {
      $survey_id: SURVEY_ID,
      [responseKey]: isNoResponse ? "No response" : role,
    });

    // Redirect to sign-up if the user isn't logged in
    if (!isSignedIn) {
      window.location.href = `${
        import.meta.env.VITE_SIGN_UP_URL
      }?redirectUrl=${encodeURIComponent(window.location.href)}`;
    }
  };

  // --- Return values to be used by the component ---
  return {
    showSurvey,
    setShowSurvey,
    hasDoneSurvey,
    onSurveySubmit,
  };
}
