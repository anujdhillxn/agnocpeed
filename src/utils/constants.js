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

export const PLATFORM_NAMES = ["codeforces", "atcoder", "codechef", "practice"];
export const LANGUAGES = ["cpp", "py"];
export const ACCEPTED_VERDICTS = ["AC", "OK"];
export const REJECTED_VERDICTS = ["TLE", "WA", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RE", "RUNTIME_ERROR"];

export const INITIAL_STATE = {
    submissions: [],
    problemList: [],
    problemDetails: null, //JSON
    currentProblem: null, //number
    log: "",
    language: 0,
    contestId: null,
    website: null,
}

export const APP_LAYOUT = {
    global: { tabEnableClose: false },
    borders: [
        {
            "type": "border",
            "location": "bottom",
            "size": 100,
            "children": [
                {
                    "type": "tab",
                    "name": "Actions",
                    "component": Actions
                },
                {
                    "type": "tab",
                    "name": "Log",
                    "component": Log
                },
                {
                    "type": "tab",
                    "name": "Submissions",
                    "component": Submissions
                },
                {
                    "type": "tab",
                    "name": "Standings",
                    "component": "text"
                },
                {
                    "type": "tab",
                    "name": "Test Cases",
                    "component": TestCases
                },
            ]
        }
    ],
    layout: {
        "type": "row",
        "weight": 100,
        "children": []
    }
};