import { useContext } from "react";
import { appContext } from "../App";
import Dropdown from "../Components/Dropdown";
import { Store } from "react-notifications-component";
import notification from '../Components/notif';
import { CHANGE_LANGUAGE, CHANGE_PROBLEM, CHANGE_PROBLEM_DETAILS, CHANGE_SERVER_MESSAGE, LANGUAGES } from "../utils/constants";
import axios from "axios";
export default function Actions() {
    const { state, dispatch } = useContext(appContext);

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

    const saveLayout = async () => {

    }

    return <div className="actions">
        <Dropdown
            label={"Currently solving"}
            list={state.problemList}
            displayed={state.currentProblem}
            setDisplayed={(idx) => { window.api.change(idx, LANGUAGES[state.language]) }}
        />
        <button onClick={resetCode}>Reset Code</button>
        <button onClick={() => { window.api.compile(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Compile</button>
        <button onClick={() => { window.api.run(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Run</button>
        <button onClick={submitCode}>Submit</button>
        <button onClick={verifyCode}>Verify</button>
        <button onClick={saveLayout}>Save Layout</button>
        <Dropdown
            label={"Language"}
            list={LANGUAGES}
            displayed={state.language}
            setDisplayed={(idx) => { window.api.change(state.currentProblem, LANGUAGES[idx]) }}
        />
    </div>
}