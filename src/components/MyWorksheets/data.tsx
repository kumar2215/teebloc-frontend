import { gql } from "../../__generated__/gql";

export const GET_USER_WORKSHEETS = gql(`
query GetUserWorksheets($userid: String!) {
  worksheets(where: {creator: {_eq: $userid}}) {
    name
    id
    created
    worksheets_to_questions {
      question_id
      question {
        question_topics {
          topic {
            topicname
          }
        }
        paper {
          paper
        }
        level {
          level
        }
        assessment {
          assessmentname
        }
      }
    }
  }
}
`);

export const UPDATE_WORKSHEET_NAME = gql(`
  mutation UpdateWorksheetName($id: Int!, $newName: String!) {
    update_worksheets_by_pk(pk_columns: { id: $id }, _set: { name: $newName }) {
      id
      name
    }
  }
`);

export const DELETE_WORKSHEET_AND_RELATIONS = gql(`
  mutation DeleteWorksheetAndRelations($id: Int!) {
    delete_worksheets_to_questions(
      where: { worksheet_id: { _eq: $id } }
    ) {
      affected_rows
    }
    delete_worksheets_by_pk(id: $id) {
      id
    }
  }
`);
