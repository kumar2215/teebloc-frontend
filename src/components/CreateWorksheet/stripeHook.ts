import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import qs from "qs";
import { useApolloClient, useQuery } from "@apollo/client";
import { GET_USER_SUBSCRIPTION } from "../../hooks/data";

export function useStripeReturn() {
  const searchParams = useSearch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const client = useApolloClient();

  useEffect(() => {
    const params = qs.parse(searchParams, { ignoreQueryPrefix: true });
    if (params["subscription-success"] === "true") {
      setShowSuccessModal(true);
      // Refetch subscription status when success is true
      client.refetchQueries({
        include: [GET_USER_SUBSCRIPTION],
      });
    }
  }, [searchParams, client]);

  return { showSuccessModal, setShowSuccessModal };
}
