import { useContext } from "react";
import { appContext } from "../App";
import Dropdown from "../Components/Dropdown";
import { Store } from "react-notifications-component";
import notification from '../Components/notif';
import { CHANGE_LANGUAGE, CHANGE_PROBLEM, CHANGE_PROBLEM_DETAILS, CHANGE_SERVER_MESSAGE, LANGUAGES } from "../utils/constants";
import axios from "axios";
export default function Actions() {
    const { state, dispatch } = useContext(appContext);

    const compileCode = async () => {
        try {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: "Compiling code..." });
            let resp = await axios.get(
                `http://127.0.0.1:5000/compile/${state.problemList[state.currentProblem]}/${LANGUAGES[state.language]}`
            );
            const serverMessage = resp.data.message;
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: serverMessage });
            Store.addNotification({
                ...notification,
                title: "Compilation result",
                message: resp.data.message ? "See the logs" : "Compiled successfully",
                type: resp.data.message ? "danger" : "success",
            });
        } catch (e) {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
        }
    };

    const runCode = async () => {
        try {
            state.problemDetails[state.problemList[state.currentProblem]].test_cases.forEach(
                async (item, idx) => {
                    let payload = {
                        testCase: item,
                    };
                    let resp = await axios.post(
                        `http://127.0.0.1:5000/run/${state.problemList[state.currentProblem]}/${LANGUAGES[state.language]}`,
                        payload
                    );
                    let newDetails = { ...state.problemDetails };
                    newDetails[state.problemList[state.currentProblem]].test_cases[idx]["result"] =
                        resp.data.result;
                    newDetails[state.problemList[state.currentProblem]].test_cases[idx]["comments"] =
                        resp.data.comments;
                    newDetails[state.problemList[state.currentProblem]].test_cases[idx]["verdict"] =
                        resp.data.verdict;
                    dispatch({ type: CHANGE_PROBLEM_DETAILS, payload: newDetails });
                }
            );
        } catch (e) {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
        }
    };

    const submitCode = async () => {
        try {
            let resp = await axios.get(
                `http://127.0.0.1:5000/submit/${state.problemList[state.currentProblem]}`
            );
            Store.addNotification({
                ...notification,
                title: "Submission result",
                message: resp.data.status ? "Submitted successfully" : "Try again",
                type: resp.data.status ? "success" : "danger",
            });
        } catch (e) {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
        }
    };

    const resetCode = async () => {
        try {
            await axios.get(
                `http://127.0.0.1:5000/reset_code/${state.problemList[state.currentProblem]}/${LANGUAGES[state.language]}`
            );
        } catch (e) {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
        }
    };

    const verifyCode = async () => {
        try {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: "Stress testing the solution..." });
            let resp = await axios.get(
                `http://127.0.0.1:5000/verify/${state.problemList[state.currentProblem]}/${LANGUAGES[state.language]}`
            );
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: resp.data.status + resp.data.failedInputs });
        } catch (e) {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
        }
    };

    return <div className="actions">
        <Dropdown
            label={"Currently solving"}
            list={state.problemList}
            displayed={state.currentProblem}
            actionType={CHANGE_PROBLEM}
        />
        <button onClick={resetCode}>Reset Code</button>
        <button onClick={compileCode}>Compile</button>
        <button onClick={runCode}>Run</button>
        <button onClick={submitCode}>Submit</button>
        <button onClick={verifyCode}>Verify</button>
        <Dropdown
            label={"Language"}
            list={LANGUAGES}
            displayed={state.language}
            actionType={CHANGE_LANGUAGE}
        />
    </div>
}