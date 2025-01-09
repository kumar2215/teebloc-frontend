import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import qs from "qs";
import { useApolloClient, useQuery } from "@apollo/client";
import { GET_USER_SUBSCRIPTION } from "../../hooks/data";
import { useUser } from "@clerk/clerk-react";

export function useStripeReturn() {
  const searchParams = useSearch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const client = useApolloClient();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const params = qs.parse(searchParams, { ignoreQueryPrefix: true });
    if (params["subscription-success"] === "true") {
      setShowSuccessModal(true);

      // Wait for user to be loaded before refetching
      console.log("User is loaded?: ", isLoaded);
      if (!isLoaded) {
        const checkAndRefetch = setInterval(() => {
          console.log("Refetching...");
          if (user?.id) {
            client.refetchQueries({
              include: [GET_USER_SUBSCRIPTION],
            });
            clearInterval(checkAndRefetch);
          }
        }, 100);

        // Cleanup the interval if component unmounts
        return () => clearInterval(checkAndRefetch);
      } else if (user?.id) {
        // User is already loaded, refetch immediately
        client.refetchQueries({
          include: [GET_USER_SUBSCRIPTION],
        });
      }
    }
  }, [searchParams, client, user, isLoaded]);

  return { showSuccessModal, setShowSuccessModal };
}
