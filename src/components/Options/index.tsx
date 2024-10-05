import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { OnChangeValue } from "react-select";
import CustomSelect from "../CusomSelect";
import Instructions from "../instructions";
import { useUser } from "@clerk/clerk-react";
import Questions from "../Questions";
import {
  GET_ASSESSMENTS,
  GET_LEVELS,
  GET_PAPERS,
  GET_QUESTIONS,
  GET_SCHOOLS,
  GET_SUBJECTS,
  GET_TOPICS,
} from "./data";
import { useBatchQueryParamState, useQueryParamsState } from "./hook";
import { pdf } from "@react-pdf/renderer";
import { cartItemsVar } from "../Cart/data";
import { PDFDocument } from "../MyWorksheets/pdf";
import posthog from "posthog-js";
import CustomOption from "./CustomOption";

export interface Option {
  readonly value: string;
  readonly label: string;
}

const commonSelectSettings = {
  hideSelectedOptions: false,
  isClearable: true,
  closeMenuOnSelect: false,
  styles: {
    container: (baseStyles) => ({
      ...baseStyles,
      display: "flex",
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: "black",
    }),
    option: (baseStyles) => ({
      ...baseStyles,
      whiteSpace: "nowrap",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      display: "flex",
      width: "fit-content",
      flexDirection: "column",
    }),
    menuList: (baseStyles) => ({
      ...baseStyles,
      display: "flex",
      width: "100%",
      flexDirection: "column",
    }),
  },
};

const paperLabels = {
  1: "MCQ",
  2: "Open Ended",
  3: "Open Ended",
};

function useIsAdmin() {
  const { user } = useUser();
  return user?.publicMetadata?.role === "admin";
}

export default function Options() {
  const isAdmin = useIsAdmin();

  // State to track scroll position
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5000) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Subjects
  const { loading, error, data } = useQuery(GET_SUBJECTS);
  // const [selectedSubject, setSelectedSubject] = useState<Option>();
  let [selectedSubject, setSelectedSubject] = useQueryParamsState("subject");

  // Topics
  const {
    loading: t_loading,
    error: t_error,
    data: t_data,
  } = useQuery(GET_TOPICS, {
    variables: { subject: selectedSubject?.value || "" },
  });
  const [selectedTopics, setSelectedTopics] = useQueryParamsState("topics", []);

  // Levels
  const {
    loading: l_loading,
    error: l_error,
    data: l_data,
  } = useQuery(GET_LEVELS, {
    variables: { subject: selectedSubject?.value || "" },
  });
  const [selectedLevels, setSelectedLevels] = useQueryParamsState("levels", []);

  // Papers
  const {
    loading: p_loading,
    error: p_error,
    data: p_data,
  } = useQuery(GET_PAPERS, {
    variables: {
      subject: selectedSubject?.value || "",
    },
  });
  const [selectedPapers, setSelectedPapers] = useQueryParamsState("papers", []);

  // Assessments
  const {
    loading: a_loading,
    error: a_error,
    data: a_data,
  } = useQuery(GET_ASSESSMENTS, {
    variables: {
      levels: selectedLevels?.map((l) => l.value) || [],
    },
  });
  const [selectedAssessments, setSelectedAssessments] = useQueryParamsState(
    "assessments",
    []
  );

  // Schools
  const {
    loading: s_loading,
    error: s_error,
    data: s_data,
  } = useQuery(GET_SCHOOLS, {
    variables: {
      subject: selectedSubject?.value || "",
    },
  });
  const [selectedSchools, setSelectedSchools] = useQueryParamsState(
    "schools",
    []
  );

  // Questions
  const {
    loading: q_loading,
    error: q_error,
    data: q_data,
    fetchMore,
  } = useQuery(GET_QUESTIONS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      offset: 0,
      limit: 20,
      topics: selectedTopics?.map((t) => t.value) || [],
      levels: selectedLevels?.map((l) => l.value) || [],
      papers: selectedPapers?.map((p) => p.value) || [],
      assessments: selectedAssessments?.map((a) => a.value) || [],
      schools: selectedSchools?.map((s) => s.value) || [],
    },
  });

  // Add variable that checks whether all options have at least one value selected (by checking null or empty array)
  const allOptionsSelected =
    selectedSubject &&
    selectedTopics.length > 0 &&
    selectedLevels.length > 0 &&
    selectedPapers.length > 0 &&
    selectedAssessments.length > 0 &&
    selectedSchools.length > 0;

  const setBatchQuery = useBatchQueryParamState();

  const [downloadLoading, setDownloadLoading] = useState(false);

  async function downloadPDF() {
    setDownloadLoading(true);
    const cartItems = cartItemsVar();
    const questions = cartItems.map((id) => {
      return q_data?.questions.find((q) => q.id === id);
    });
    console.log(questions);

    if (questions.length === 0) {
      return;
    }

    const doc = <PDFDocument questionsData={{ questions }} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    newTab.focus();

    setDownloadLoading(false);
  }

  useEffect(() => {
    if (q_data && q_data.questions.length > 0) {
      posthog.capture("questions_shown", {
        count: q_data.questions.length,
        subject: selectedSubject?.value,
        topics: selectedTopics.map((t) => t.value),
        levels: selectedLevels.map((l) => l.value),
        papers: selectedPapers.map((p) => p.value),
        assessments: selectedAssessments.map((a) => a.value),
        schools: selectedSchools.map((s) => s.value),
      });
    }
  }, [q_data]);

  // Modify the useEffect to handle auto-selection
  useEffect(() => {
    if (
      selectedSubject &&
      selectedTopics.length > 0 &&
      !l_loading &&
      !p_loading &&
      !a_loading &&
      !s_loading &&
      l_data &&
      p_data &&
      a_data &&
      s_data
    ) {
      // Auto-select all schools
      const allSchools = s_data.schools.map((s) => ({
        value: s.schoolname,
        label: s.schoolname,
      }));
      setSelectedSchools(allSchools);
    }
  }, [
    selectedSubject,
    selectedTopics,
    l_loading,
    p_loading,
    a_loading,
    s_loading,
    l_data,
    p_data,
    a_data,
    s_data,
  ]);

  if (error || t_error || l_error || p_error || a_error || s_error || q_error) {
    console.log(error, t_error, l_error, p_error, a_error, s_error, q_error);
    return `Error! ${error}`;
  }

  return (
    <div className="mx-8 mb-8 flex gap-8 flex-col">
      <Instructions />
      <div className="my-2 flex flex-col justify-start gap-2">
        {/* <CustomOption
          options={data?.subjects.map((s) => ({
            value: s.subject,
            label: s.subject,
          }))}
          selectedOptions={selectedSubject}
          setSelectedOptions={setSelectedSubject}
          placeholder="Subject"
        /> */}

        <CustomSelect
          {...commonSelectSettings}
          isClearable={false}
          isLoading={loading}
          placeholder="Subject"
          isSearchable={false}
          value={selectedSubject}
          onChange={(selectedOption) => {
            setBatchQuery({
              subject: selectedOption.value,
            });
          }}
          options={
            data &&
            data.subjects.map((s) => {
              return { value: s.subject, label: s.subject };
            })
          }
        />
        <CustomSelect
          {...commonSelectSettings}
          setValues={setSelectedTopics}
          haveSelectAll
          isLoading={t_loading}
          placeholder="Topics"
          isSearchable
          isMulti
          value={selectedTopics}
          onChange={(selectedOptions: OnChangeValue<Option, true>) => {
            selectedOptions && setSelectedTopics(selectedOptions);
          }}
          options={
            t_data &&
            t_data.topics.map((s) => {
              return { value: s.topicname, label: s.topicname };
            })
          }
        />
        <CustomSelect
          {...commonSelectSettings}
          setValues={setSelectedLevels}
          haveSelectAll
          isLoading={l_loading}
          placeholder="Levels"
          isSearchable={false}
          isMulti
          value={selectedLevels}
          onChange={(selectedOptions: OnChangeValue<Option, true>) => {
            selectedOptions && setSelectedLevels(selectedOptions);
          }}
          options={
            l_data &&
            l_data.levels.map((s) => {
              return { value: s.level, label: s.level };
            })
          }
        />
        <CustomSelect
          {...commonSelectSettings}
          setValues={setSelectedPapers}
          haveSelectAll
          isLoading={p_loading}
          placeholder="Papers"
          isSearchable={false}
          isMulti
          value={selectedPapers}
          onChange={(selectedOptions: OnChangeValue<Option, true>) => {
            selectedOptions && setSelectedPapers(selectedOptions);
          }}
          options={
            p_data &&
            p_data.papers.map((s) => {
              return {
                value: s.paper,
                label: `${s.paper} (${paperLabels[s.paper]})`,
              };
            })
          }
        />
        <CustomSelect
          {...commonSelectSettings}
          setValues={setSelectedAssessments}
          haveSelectAll
          isLoading={a_loading}
          isSearchable={false}
          placeholder="Assessments"
          isMulti
          value={selectedAssessments}
          onChange={(selectedOptions: OnChangeValue<Option, true>) => {
            selectedOptions && setSelectedAssessments(selectedOptions);
          }}
          options={
            a_data &&
            a_data.assessments.map((s) => {
              return { value: s.assessmentname, label: s.assessmentname };
            })
          }
        />
        <CustomSelect
          {...commonSelectSettings}
          setValues={setSelectedSchools}
          haveSelectAll
          isLoading={s_loading}
          isSearchable={false}
          placeholder="Schools"
          isMulti
          value={selectedSchools}
          onChange={(selectedOptions: OnChangeValue<Option, true>) => {
            selectedOptions && setSelectedSchools(selectedOptions);
          }}
          options={
            s_data &&
            s_data.schools.map((s) => {
              return { value: s.schoolname, label: s.schoolname };
            })
          }
        />
      </div>

      {/* We only want to show the top loading spinner when no questions have been
      loaded yet. Once some questions have been loaded, the bottom "load more"
      button will be the one doing the loading. */}
      {q_loading && (q_data?.questions || []).length === 0 && (
        <span className="loading loading-spinner loading-lg"></span>
      )}
      {q_data && <div>{q_data.questions.length} results</div>}

      {isAdmin && (
        <>
          <div
            onClick={downloadPDF}
            className="btn btn-neutral btn-lg w-60 fixed bottom-4 right-4 z-10"
          >
            {downloadLoading && (
              <span className="loading loading-spinner"></span>
            )}
            {downloadLoading ? "Loading" : "Download worksheet"}
          </div>

          <div
            onClick={() => {
              cartItemsVar([]);
            }}
            className="btn btn-neutral btn-lg fixed bottom-4 right-72 z-10"
          >
            Clear questions
          </div>
        </>
      )}

      {q_data?.questions.length === 0 && allOptionsSelected && (
        <div>
          No results. Try selecting more options to broaden your search!
        </div>
      )}

      <Questions
        questions={q_data?.questions || []}
        loading={q_loading}
        onLoadMore={() => {
          fetchMore({
            variables: {
              offset: q_data?.questions.length,
            },
          });
        }}
      />

      {/* Go to top button */}
      {showScrollTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-10 p-2 bg-gray-500 text-white rounded-full"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}
