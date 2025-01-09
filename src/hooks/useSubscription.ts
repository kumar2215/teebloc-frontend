import { useQuery } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { GET_USER_SUBSCRIPTION } from "./data";
import { useEffect } from "react";

export function useSubscription() {
  const { user, isLoaded } = useUser();
  console.log("User: ", user);
  console.log("Is user loaded?: ", isLoaded);

  const { data, loading, refetch } = useQuery(GET_USER_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Set up effect to refetch when user becomes available
  useEffect(() => {
    if (isLoaded && user?.id) {
      console.log("User loaded, refetching subscription status");
      refetch();
    }
  }, [isLoaded, user?.id, refetch]);

  const hasActiveSubscription = data?.subscriptions?.[0]?.status === "active";
  console.log("Use subscription data: ", data);
  console.log("hasActiveSubscription", hasActiveSubscription);

  return {
    hasActiveSubscription,
    loading,
    refetch, // Optionally expose refetch if needed elsewhere
  };
}
