import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { ClerkProvider } from "@clerk/clerk-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProviderWrapper } from "./ApolloProviderWrapper.tsx";
import App from "./App.tsx";
import { PostHogProvider } from "posthog-js/react";

import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

if (process.env.NODE_ENV !== "production") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const options = {
  api_host: import.meta.env.REACT_APP_PUBLIC_POSTHOG_HOST,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ApolloProviderWrapper>
          <App />
        </ApolloProviderWrapper>
      </ClerkProvider>
    </PostHogProvider>
  </React.StrictMode>,
);
