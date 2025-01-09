import { useQuery } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { GET_USER_SUBSCRIPTION } from "./data";

export function useSubscription() {
  const { user } = useUser();

  const { data, loading, refetch } = useQuery(GET_USER_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const hasActiveSubscription = data?.subscriptions?.[0]?.status === "active";

  return {
    hasActiveSubscription,
    loading,
    refetch, // Optionally expose refetch if needed elsewhere
  };
}
