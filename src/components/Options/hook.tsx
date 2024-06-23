import { makeVar } from "@apollo/client";
import qs from "qs";
import { useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";

function transformIncoming(value) {
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

export const useBatchQueryParamState = () => {
  const [location, setLocation] = useLocation();
  const overrideQuery = useCallback(
    (values) => {
      const queryString = qs.stringify(
        {
          ...values,
        },
        { skipNulls: true }
      );
      setLocation(`${location.split("?")[0]}?${queryString}`);
    },
    [location]
  );
  return overrideQuery;
};

export const useQueryParamsState = (query: string, initialValue: any) => {
  const [location, setLocation] = useLocation();
  const searchParams = useSearch();
  // On first load, if searchParams is empty but reactive variable is not, set the searchParams to the reactive variable
  useEffect(() => {
    if (!searchParams) {
      if (questionsSearchParams()) {
        setLocation(`${location.split("?")[0]}?${questionsSearchParams()}`);
      }
    }
  }, [searchParams, query]);

  const setQuery = useCallback(
    (value) => {
      // Transform incoming value
      value = transformIncoming(value);

      const existingQueries = qs.parse(searchParams, {
        ignoreQueryPrefix: true,
      });

      const queryString = qs.stringify(
        // We need to do value.value since state is in the form of
        {
          ...existingQueries,
          [query]: value,
        },
        { skipNulls: true }
      );

      setLocation(`${location.split("?")[0]}?${queryString}`, {
        replace: true,
      });
    },
    [setLocation, location, query, searchParams]
  );

  // Keep the reactive variable in sync with the URL
  useEffect(() => {
    if (searchParams) {
      questionsSearchParams(searchParams);
    }
  }, [searchParams]);

  let value =
    // From the qs docs:
    // qs will also limit specifying indices in an array to a maximum index of 20.
    // Any array members with an index of greater than 20 will instead be converted to an object with the index as the key.
    // This is needed to handle cases when someone sent, for example, a[999999999] and it will take significant time to iterate over this huge array.
    qs.parse(searchParams, { ignoreQueryPrefix: true, arrayLimit: 100 })[
      query
    ] || initialValue;

  value = transformOutgoing(value);

  return [
    // If value is an array, return an array of objects with value and label. If not, just return one <object data="
    value,
    setQuery,
  ];
};
