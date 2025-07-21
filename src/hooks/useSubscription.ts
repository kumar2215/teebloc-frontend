import { useQuery } from "@apollo/client";
import { useUser } from "@clerk/clerk-react";
import { GET_USER_SUBSCRIPTION } from "./data";
import { useIsAdmin } from "./useIsAdmin";

export function useSubscription() {
  const { user } = useUser();
  const isAdmin = useIsAdmin();

  const { data, loading, refetch } = useQuery(GET_USER_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
    fetchPolicy: "network-only",
  });

  const hasActiveSubscription =
    ["active", "past_due"].includes(data?.subscriptions?.[0]?.status || "") ||
    isAdmin;

  return {
    hasActiveSubscription,
    loading,
    refetch, // Optionally expose refetch if needed elsewhere
  };
}
