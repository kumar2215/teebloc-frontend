import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  questionContainer: {
    marginTop: 20,
  },
  questionImageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottom: "1px solid black",
  },
  questionNumber: {
    position: "absolute",
    fontSize: 30,
    left: 10,
  },
  questionImage: {
    width: "70%",
  },
  answersPage: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingLeft: 10,
    paddingRight: 10,
  },
  answersTitle: {
    fontSize: 30,
    marginBottom: 20,
  },
  answerContainer: {
    marginBottom: 20,
  },
  answerImageContainer: {
    flexDirection: "column",
    // justifyContent: "center",
    borderBottom: "1px solid black",
  },
  answerNumber: {
    position: "absolute",
    fontSize: 30,
  },
  answerImage: {
    marginLeft: 40,
    width: "70%",
    marginBottom: 20,
  },
});

export function PDFDocument({ questionsData }) {
  if (!questionsData) return null;

  let questions = JSON.parse(JSON.stringify(questionsData.questions));
  // Cut out first question
  // questions = questions.slice(1);

  // const questions = questionsData.questions;
  console.log("Questions: ", questions);

  const sortedByPaper = questions.sort((a, b) => {
    return parseInt(a.paper.paper) - parseInt(b.paper.paper);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sortedByPaper.map((question, questionIndex) => (
          <View style={styles.questionContainer} key={question.id}>
            {question.questionimgs
              .sort((a, b) => {
                const regex = /Q(\d+)-(\d+)\./;
                const aMatch = a.questionimgname.match(regex);
                const bMatch = b.questionimgname.match(regex);
                if (aMatch && bMatch) {
                  return aMatch[2] - bMatch[2];
                } else {
                  return 0;
                }
              })
              .map((questionImage, index) => (
                <View
                  key={questionImage.questionimgid}
                  style={[
                    styles.questionImageContainer,
                    {
                      borderBottom:
                        question.questionimgs.length === 1 ||
                        (question.questionimgs.length > 1 &&
                          index === question.questionimgs.length - 1)
                          ? "1px solid black"
                          : "none",
                    },
                  ]}
                >
                  <Text style={styles.questionNumber}>
                    {index === 0 ? questionIndex + 1 : ""}
                  </Text>
                  <Image
                    src={`${import.meta.env.VITE_BACKEND_API}/images/question/${
                      questionImage.questionimgid
                    }`}
                    style={styles.questionImage}
                  />
                </View>
              ))}
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.answersPage}>
        <Text style={styles.answersTitle}>Answers</Text>

        {sortedByPaper.map((question, questionIndex) => (
          <View key={question.id} style={styles.answerContainer}>
            {question.answerimgs
              .sort((a, b) => {
                const regex = /Q(\d+)-(\d+)\./;
                const aMatch = a.answerimgname.match(regex);
                const bMatch = b.answerimgname.match(regex);
                if (aMatch && bMatch) {
                  return aMatch[2] - bMatch[2];
                } else {
                  return 0;
                }
              })
              .map((answerImage, index) => (
                <View
                  wrap={false}
                  key={answerImage.answerimgid}
                  style={styles.answerImageContainer}
                >
                  <Text style={styles.answerNumber}>
                    {index === 0 ? questionIndex + 1 : ""}
                  </Text>
                  <Image
                    src={`${import.meta.env.VITE_BACKEND_API}/images/answer/${
                      answerImage.answerimgid
                    }`}
                    style={[
                      styles.answerImage,
                      {
                        width: question.paper.paper === 1 ? "10%" : "70%",
                      },
                    ]}
                  />
                </View>
              ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
