/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\nquery GetQuestionsById($ids: [String!]) {\n  questions(\n    where: {\n        id: {_in: $ids}\n    }\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n": types.GetQuestionsByIdDocument,
    "\n  query GetFreeWorksheetsLeft($userid: String!) {\n    users(where: { id: { _eq: $userid } }) {\n      free_worksheets_count\n    }\n  }\n": types.GetFreeWorksheetsLeftDocument,
    "\n  mutation DecrementFreeWorksheets($userid: String!) {\n    update_users_by_pk(\n      pk_columns: { id: $userid }\n      _inc: { free_worksheets_count: -1 }\n    ) {\n      id\n      free_worksheets_count\n    }\n  }\n": types.DecrementFreeWorksheetsDocument,
    "\nquery GetUserWorksheets($userid: String!) {\n  worksheets(where: {creator: {_eq: $userid}}) {\n    name\n    id\n    created\n    worksheets_to_questions {\n      question_id\n    }\n  }\n}\n": types.GetUserWorksheetsDocument,
    "\nquery GetSubjects {\n  subjects {\n    subject\n    subjectid\n  }\n}\n": types.GetSubjectsDocument,
    "\nquery GetTopics($subject: String) {\n  topics(where: {subject: {subject: {_eq: $subject}}}) {\n    topicname\n  }\n}\n": types.GetTopicsDocument,
    "\nquery GetLevels($subject: String) {\n  levels(where: {subject_levels: {subject: {subject: {_eq: $subject}}}}) {\n    level\n  }\n}\n": types.GetLevelsDocument,
    "\nquery GetPapers($subject: String) {\n  papers(where: {subject_papers: {subject: {subject: {_eq: $subject}}}}) {\n    paper\n  }\n}\n": types.GetPapersDocument,
    "\nquery GetAssessments($levels: [String!]) {\n  assessments(where: {assessment_levels: {level: {level: {_in: $levels}}}}) {\n    assessmentname\n  }\n}\n": types.GetAssessmentsDocument,
    "\nquery GetSchools($subject: String) {\n  schools(where: {school_subjects: {subject: {subject: {_eq: $subject}}}}) {\n    schoolname\n  }\n}\n": types.GetSchoolsDocument,
    "\nquery GetQuestions($offset: Int, $limit: Int, $topics: [String!], $levels: [String!], $papers: [bigint!], $assessments: [String!], $schools: [String!]) {\n  questions(\n    where: {\n      question_topics: {topic: {topicname: {_in: $topics}}}, \n      level: {level: {_in: $levels}}, \n      paper: {paper: {_in: $papers}}, \n      assessment: {assessmentname: {_in: $assessments}}, \n      school: {schoolname: {_in: $schools}}, \n    }\n    offset: $offset,\n    limit: $limit\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n": types.GetQuestionsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetQuestionsById($ids: [String!]) {\n  questions(\n    where: {\n        id: {_in: $ids}\n    }\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n"): (typeof documents)["\nquery GetQuestionsById($ids: [String!]) {\n  questions(\n    where: {\n        id: {_in: $ids}\n    }\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetFreeWorksheetsLeft($userid: String!) {\n    users(where: { id: { _eq: $userid } }) {\n      free_worksheets_count\n    }\n  }\n"): (typeof documents)["\n  query GetFreeWorksheetsLeft($userid: String!) {\n    users(where: { id: { _eq: $userid } }) {\n      free_worksheets_count\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DecrementFreeWorksheets($userid: String!) {\n    update_users_by_pk(\n      pk_columns: { id: $userid }\n      _inc: { free_worksheets_count: -1 }\n    ) {\n      id\n      free_worksheets_count\n    }\n  }\n"): (typeof documents)["\n  mutation DecrementFreeWorksheets($userid: String!) {\n    update_users_by_pk(\n      pk_columns: { id: $userid }\n      _inc: { free_worksheets_count: -1 }\n    ) {\n      id\n      free_worksheets_count\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetUserWorksheets($userid: String!) {\n  worksheets(where: {creator: {_eq: $userid}}) {\n    name\n    id\n    created\n    worksheets_to_questions {\n      question_id\n    }\n  }\n}\n"): (typeof documents)["\nquery GetUserWorksheets($userid: String!) {\n  worksheets(where: {creator: {_eq: $userid}}) {\n    name\n    id\n    created\n    worksheets_to_questions {\n      question_id\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetSubjects {\n  subjects {\n    subject\n    subjectid\n  }\n}\n"): (typeof documents)["\nquery GetSubjects {\n  subjects {\n    subject\n    subjectid\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetTopics($subject: String) {\n  topics(where: {subject: {subject: {_eq: $subject}}}) {\n    topicname\n  }\n}\n"): (typeof documents)["\nquery GetTopics($subject: String) {\n  topics(where: {subject: {subject: {_eq: $subject}}}) {\n    topicname\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetLevels($subject: String) {\n  levels(where: {subject_levels: {subject: {subject: {_eq: $subject}}}}) {\n    level\n  }\n}\n"): (typeof documents)["\nquery GetLevels($subject: String) {\n  levels(where: {subject_levels: {subject: {subject: {_eq: $subject}}}}) {\n    level\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetPapers($subject: String) {\n  papers(where: {subject_papers: {subject: {subject: {_eq: $subject}}}}) {\n    paper\n  }\n}\n"): (typeof documents)["\nquery GetPapers($subject: String) {\n  papers(where: {subject_papers: {subject: {subject: {_eq: $subject}}}}) {\n    paper\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetAssessments($levels: [String!]) {\n  assessments(where: {assessment_levels: {level: {level: {_in: $levels}}}}) {\n    assessmentname\n  }\n}\n"): (typeof documents)["\nquery GetAssessments($levels: [String!]) {\n  assessments(where: {assessment_levels: {level: {level: {_in: $levels}}}}) {\n    assessmentname\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetSchools($subject: String) {\n  schools(where: {school_subjects: {subject: {subject: {_eq: $subject}}}}) {\n    schoolname\n  }\n}\n"): (typeof documents)["\nquery GetSchools($subject: String) {\n  schools(where: {school_subjects: {subject: {subject: {_eq: $subject}}}}) {\n    schoolname\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetQuestions($offset: Int, $limit: Int, $topics: [String!], $levels: [String!], $papers: [bigint!], $assessments: [String!], $schools: [String!]) {\n  questions(\n    where: {\n      question_topics: {topic: {topicname: {_in: $topics}}}, \n      level: {level: {_in: $levels}}, \n      paper: {paper: {_in: $papers}}, \n      assessment: {assessmentname: {_in: $assessments}}, \n      school: {schoolname: {_in: $schools}}, \n    }\n    offset: $offset,\n    limit: $limit\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n"): (typeof documents)["\nquery GetQuestions($offset: Int, $limit: Int, $topics: [String!], $levels: [String!], $papers: [bigint!], $assessments: [String!], $schools: [String!]) {\n  questions(\n    where: {\n      question_topics: {topic: {topicname: {_in: $topics}}}, \n      level: {level: {_in: $levels}}, \n      paper: {paper: {_in: $papers}}, \n      assessment: {assessmentname: {_in: $assessments}}, \n      school: {schoolname: {_in: $schools}}, \n    }\n    offset: $offset,\n    limit: $limit\n  ) {\n    answerimgs {\n      answerimgname\n      answerimgid\n    }\n    questionimgs {\n      questionimgname\n      questionimgid\n    }\n    assessment {\n      assessmentname\n    }\n    level {\n      level\n    }\n    paper {\n      paper\n    }\n    school {\n      schoolname\n    }\n    id\n    question_topics {\n      topic {\n        topicname\n      }\n    }\n  }\n}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;