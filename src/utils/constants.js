import { createTheme } from "@mui/material";

export const PLATFORM_NAMES = ["codeforces", "atcoder", "codechef", "practice"];
export const ACCEPTED_VERDICTS = ["AC", "Accepted", "Pretests passed"];
export const REJECTED_VERDICTS = [
  "TLE",
  "MLE",
  "WA",
  "RE",
  "Time limit exceeded",
  "Memory limit exceeded",
  "Wrong answer",
  "Runtime error",
];

export const INITIAL_STATE = {
  website: null,
  contestId: null,
  problemList: [],
  problemDetails: {},
  currentProblem: null,
  currentLanguage: null,
  submissions: [],
  standings: null,
  log: "",
  config: null,
};

export const THEME = createTheme({
  typography: {
    fontFamily: `'Montserrat', sans-serif`,
  },
});
