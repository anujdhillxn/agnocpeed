import { CHANGE_LANGUAGE, CHANGE_PROBLEM, CHANGE_PROBLEM_DETAILS, CHANGE_PROBLEM_LIST, CHANGE_SERVER_MESSAGE, ACCEPTED_VERDICTS, REJECTED_VERDICTS, CHANGE_SUBMISSIONS, CHANGE_STATE, CHANGE_CONTEST_ID, CHANGE_WEBSITE } from "./constants";

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
            return { ...state, log: action.payload };
        case CHANGE_WEBSITE:
            return { ...state, website: action.payload };
        case CHANGE_CONTEST_ID:
            return { ...state, contestId: action.payload };
        case CHANGE_STATE:
            return { ...state, ...action.payload }
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

export const serialize = (obj) => {
    console.log(obj);
    if (typeof obj === "object") {
        delete obj.component;
        const keys = Object.keys(obj);
        keys.forEach((item) => serialize(obj[item]));
    }
}
