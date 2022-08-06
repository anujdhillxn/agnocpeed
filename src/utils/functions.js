import { CHANGE_LANGUAGE, CHANGE_PROBLEM, CHANGE_PROBLEM_DETAILS, CHANGE_PROBLEM_LIST, CHANGE_BROWSER_READY, CHANGE_CONTEST_READY, CHANGE_SERVER_MESSAGE, ACCEPTED_VERDICTS, REJECTED_VERDICTS, CHANGE_SUBMISSIONS } from "./constants";

export const reducer = (state, action) => { // action = {type, payload}
    switch (action.type) {
        case CHANGE_PROBLEM:
            return { ...state, currentProblem: action.payload };
        case CHANGE_SUBMISSIONS:
            return { ...state, submissions: action.payload };
        case CHANGE_PROBLEM_LIST:
            return { ...state, problemList: action.payload };
        case CHANGE_PROBLEM_DETAILS:
            return { ...state, problemDetails: action.payload };
        case CHANGE_LANGUAGE:
            return { ...state, language: action.payload };
        case CHANGE_SERVER_MESSAGE:
            return { ...state, serverMessage: action.payload };
        case CHANGE_BROWSER_READY:
            return { ...state, browserReady: action.payload };
        case CHANGE_CONTEST_READY:
            return { ...state, contestReady: action.payload };
        default:
            return state;
    }
}

export const getColor = (verdict) => {
    if (ACCEPTED_VERDICTS.includes(verdict))
        return "lightgreen";
    if (REJECTED_VERDICTS.includes(verdict))
        return "red";
    return "yellow";
};
