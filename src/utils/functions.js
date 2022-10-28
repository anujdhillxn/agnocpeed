import { ACCEPTED_VERDICTS, REJECTED_VERDICTS } from "./constants";

export const getColor = (verdict) => {
  if (verdict === undefined) return "yellow";
  let decision = 0;
  ACCEPTED_VERDICTS.forEach((item) => {
    if (verdict.startsWith(item)) decision = 1;
  });
  REJECTED_VERDICTS.forEach((item) => {
    if (verdict.startsWith(item)) decision = -1;
  });
  if (decision) return decision === 1 ? "lightgreen" : "red";
  return "yellow";
};

export const serialize = (obj) => {
  if (typeof obj === "object") {
    delete obj.component;
    const keys = Object.keys(obj);
    keys.forEach((item) => serialize(obj[item]));
  }
};

export const isOk = (testCase) => {
  return testCase.verdict === "AC" && testCase.comments === "";
};

export const countPassed = (testCases) => {
  let passed = 0;
  for (let i = 0; i < testCases.length; i++) passed += isOk(testCases[i]);
  return passed;
};
