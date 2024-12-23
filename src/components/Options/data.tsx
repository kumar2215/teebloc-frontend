import { gql } from "../../__generated__/gql";

export const GET_ALL_OPTIONS = gql(`
query GetAllOptions {
  # Get all levels
  levels {
    level
    levelid
  }
  # Get all subjects and their associated levels
  subjects {
    subject
    subjectid
    subject_levels {
      level {
        level
      }
    }
  }
  # Get all topics and their associated subjects
  topics {
    topicname
    subject {
      subject
    }
  }
  # Get all papers and their associated subjects
  papers {
    paper
    subject_papers {
      subject {
        subject
      }
    }
  }
  # Get all assessments and their associated levels
  assessments {
    assessmentname
    assessment_levels {
      level {
        level
      }
    }
  }
  # Get all schools and their associated subjects
  schools {
    schoolname
    school_subjects {
      subject {
        subject
      }
    }
  }
}
`);

export const GET_LEVELS = gql(`
query GetLevels {
  levels {
    level
    levelid
  }
}
`);

export const GET_SUBJECTS = gql(`
query GetSubjects($levels: [String!]) {
  subjects(where: {subject_levels: {level: {level: {_in: $levels}}}}) {
    subject
    subjectid
  }
}
`);

export const GET_TOPICS = gql(`
query GetTopics($subject: String) {
  topics(where: {subject: {subject: {_eq: $subject}}}) {
    topicname
  }
}
`);

export const GET_PAPERS = gql(`
query GetPapers($subject: String) {
  papers(where: {subject_papers: {subject: {subject: {_eq: $subject}}}}) {
    paper
  }
}
`);

export const GET_ASSESSMENTS = gql(`
query GetAssessments($levels: [String!]) {
  assessments(where: {assessment_levels: {level: {level: {_in: $levels}}}}) {
    assessmentname
  }
}
`);

export const GET_SCHOOLS = gql(`
query GetSchools($subject: String) {
  schools(where: {school_subjects: {subject: {subject: {_eq: $subject}}}}) {
    schoolname
  }
}
`);

export const GET_QUESTIONS = gql(`
query GetQuestions($offset: Int, $limit: Int, $topics: [String!], $levels: [String!], $papers: [bigint!], $assessments: [String!], $schools: [String!]) {
  questions(
    where: {
      question_topics: {topic: {topicname: {_in: $topics}}}, 
      level: {level: {_in: $levels}}, 
      paper: {paper: {_in: $papers}}, 
      assessment: {assessmentname: {_in: $assessments}}, 
      school: {schoolname: {_in: $schools}}, 
    }
    offset: $offset,
    limit: $limit
  ) {
    answerimgs {
      answerimgname
      answerimgid
    }
    questionimgs {
      questionimgname
      questionimgid
    }
    assessment {
      assessmentname
    }
    level {
      level
    }
    paper {
      paper
    }
    school {
      schoolname
    }
    id
    question_topics {
      topic {
        topicname
      }
    }
  }
}
`);

// isInCart @client
