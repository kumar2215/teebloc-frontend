import { gql } from "../../__generated__/gql";

export const GET_USER_WORKSHEETS = gql(`
query GetUserWorksheets($userid: String!) {
  worksheets(where: {creator: {_eq: $userid}}) {
    name
    id
    created
    worksheets_to_questions {
      question_id
    }
  }
}
`);
