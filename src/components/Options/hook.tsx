import { makeVar } from "@apollo/client";
import qs from "qs";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useSearch, useNavigate } from "wouter";

function transformIncoming(value) {
  if (!value) return null;
  return Array.isArray(value) ? value.map((v) => v.value) : value.value;
}

function transformOutgoing(value) {
  // If initial value is null, we want to return null as well so that the placeholder is shown in react-select
  if (!value) return value;
  return Array.isArray(value)
    ? value.map((v) => ({ value: v, label: v }))
    : { value, label: value };
}

export const questionsSearchParams = makeVar();

export const useQueryParamsState = (query: string, initialValue: any) => {
  const { setQueries } = useQueryUpdater();
  const [location, setLocation] = useLocation();
  const searchParams = useSearch();
  // What's the difference between searchParams and location?
  // useLocation simply returns the path. For example, /practice
  // useSearch returns the search params. For example, subject=123&topics=456

  // On first load, if searchParams is empty but reactive variable is not, set the searchParams to the reactive variable
  // We need this so that even if the search param changes when user navigates to another page in the app,
  // we can recover the state of the user's filters and re-populate the url search params.
  useEffect(() => {
    if (!searchParams) {
      if (questionsSearchParams()) {
        setLocation(`${location.split("?")[0]}?${questionsSearchParams()}`);
      }
    }
  }, [searchParams, query]);

  const setQuery = useCallback(
    (value) => {
      setQueries({ [query]: value });
    },
    [setQueries]
  );

  // Keep the reactive variable in sync with the URL
  useEffect(() => {
    if (searchParams) {
      questionsSearchParams(searchParams);
    }
  }, [searchParams]);

  const parsedValue = useMemo(() => {
    // From the qs docs:
    // qs will also limit specifying indices in an array to a maximum index of 20.
    // Any array members with an index of greater than 20 will instead be converted to an object with the index as the key.
    // This is needed to handle cases when someone sent, for example, a[999999999] and it will take significant time to iterate over this huge array.
    const parsed = qs.parse(searchParams, {
      ignoreQueryPrefix: true,
      arrayLimit: 100,
    });
    return parsed[query] || initialValue;
  }, [searchParams, query]);

  return [
    // If value is an array, return an array of objects with value and label. If not, just return one <object data="
    transformOutgoing(parsedValue),
    setQuery,
  ];
};

export function useQueryUpdater() {
  const [location, setLocation] = useLocation();
  const searchParams = useSearch();

  const setQueries = useCallback(
    (updates: Record<string, any>) => {
      const existingQueries = qs.parse(searchParams, {
        ignoreQueryPrefix: true,
      });

      console.log("existingQueries", existingQueries);

      const transformedUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: transformIncoming(value),
        }),
        {}
      );

      const queryString = qs.stringify(
        {
          ...existingQueries,
          ...transformedUpdates,
        },
        { skipNulls: true }
      );

      console.log("queryString", queryString);

      setLocation(`${location.split("?")[0]}?${queryString}`, {
        replace: true,
      });
    },
    [setLocation, location, searchParams]
  );

  return { setQueries };
}
