import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import qs from "qs";
import { useQuery } from "@apollo/client";
import { GET_USER_SUBSCRIPTION } from "../../hooks/data";

export function useStripeReturn() {
  const searchParams = useSearch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { refetch } = useQuery(GET_USER_SUBSCRIPTION);

  useEffect(() => {
    const params = qs.parse(searchParams, { ignoreQueryPrefix: true });
    if (params["subscription-success"] === "true") {
      setShowSuccessModal(true);
      // Refetch subscription status when success is true
      refetch();
    }
  }, [searchParams, refetch]);

  return { showSuccessModal, setShowSuccessModal };
}
