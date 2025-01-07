import { gql } from "../__generated__/gql";

export const GET_USER_SUBSCRIPTION = gql(`
  query GetUserSubscription($userId: String!) {
    subscriptions(where: {user_id: {_eq: $userId}}) {
      status
      current_period_end
    }
  }
`);
