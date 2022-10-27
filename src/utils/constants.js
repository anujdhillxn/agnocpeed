import Actions from "../Features/Actions";
import Log from "../Features/Log";
import Submissions from "../Features/Submissions";
import TestCases from "../Features/TestCases";

export const CHANGE_PROBLEM = "CHANGE_PROBLEM";
export const CHANGE_SUBMISSIONS = "CHANGE_SUBMISSIONS";
export const CHANGE_PROBLEM_LIST = "CHANGE_PROBLEM_LIST";
export const CHANGE_PROBLEM_DETAILS = "CHANGE_PROBLEM_DETAILS";
export const CHANGE_LANGUAGE = "CHANGE_LANGUAGE";
export const CHANGE_SERVER_MESSAGE = "CHANGE_SERVER_MESSAGE";
export const CHANGE_WEBSITE = "CHANGE_BROWSER_READY";
export const CHANGE_CONTEST_ID = "CHANGE_CONTEST_READY";
export const CHANGE_STATE = "CHANGE_STATE";
export const CHANGE_STANDINGS = "CHANGE_STANDINGS";
export const CHANGE_CONFIG = "CHANGE_CONFIG";
export const PLATFORM_NAMES = ["codeforces", "atcoder", "codechef", "practice"];
export const LANGUAGES = ["cpp", "py"];
export const ACCEPTED_VERDICTS = ["AC", "Accepted"];
export const REJECTED_VERDICTS = [
  "TLE",
  "WA",
  "RE",
  "Time limit exceeded",
  "Wrong answer",
  "Runtime error",
];

export const INITIAL_STATE = {
  submissions: [],
  problemList: [],
  config: {},
  problemDetails: null, //JSON
  currentProblem: null, //number
  log: "",
  language: 0,
  contestId: null,
  website: null,
  standings: null,
};

export const APP_LAYOUT = {
  global: { tabEnableClose: false },
  borders: [
    {
      type: "border",
      location: "bottom",
      size: 100,
      children: [
        {
          type: "tab",
          name: "Actions",
        },
        {
          type: "tab",
          name: "Log",
        },
        {
          type: "tab",
          name: "Submissions",
        },
        {
          type: "tab",
          name: "Standings",
        },
        {
          type: "tab",
          name: "Test Cases",
        },
        {
          type: "tab",
          name: "Statement",
        },
      ],
    },
  ],
  layout: {
    type: "row",
    weight: 100,
    children: [],
  },
};
