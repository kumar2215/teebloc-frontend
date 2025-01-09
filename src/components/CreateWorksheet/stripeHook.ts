import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import qs from "qs";
import { useQuery } from "@apollo/client";
import { GET_USER_SUBSCRIPTION } from "../../hooks/data";
import { useUser } from "@clerk/clerk-react";

export function useStripeReturn() {
  const searchParams = useSearch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = useUser();
  const { refetch } = useQuery(GET_USER_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  useEffect(() => {
    const params = qs.parse(searchParams, { ignoreQueryPrefix: true });
    if (params["subscription-success"] === "true") {
      console.log("subscription-success is true");
      setShowSuccessModal(true);
      // Refetch subscription status when success is true
      refetch();
    }
  }, [searchParams, refetch]);

  return { showSuccessModal, setShowSuccessModal };
}
