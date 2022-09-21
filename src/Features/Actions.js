import { useContext } from "react";
import { appContext } from "../App";
import Dropdown from "../Components/Dropdown";
import { Store } from "react-notifications-component";
import notification from '../Components/notif';
import { CHANGE_LANGUAGE, CHANGE_PROBLEM, CHANGE_PROBLEM_DETAILS, CHANGE_SERVER_MESSAGE, LANGUAGES } from "../utils/constants";
import axios from "axios";
import { serialize } from "../utils/functions";
export default function Actions({ model }) {
    const { state, dispatch } = useContext(appContext);

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
            setDisplayed={(idx) => { window.api.change(idx, LANGUAGES[state.language]) }}
        />
        <button onClick={() => { window.api.reset(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Reset Code</button>
        <button onClick={() => { window.api.compile(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Compile</button>
        <button onClick={() => { window.api.run(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Run</button>
        <button onClick={() => { window.api.submit(state.problemList[state.currentProblem], LANGUAGES[state.language]) }}>Submit</button>
        <button onClick={verifyCode}>Verify</button>
        <button onClick={() => {
            let modelJson = model.toJson();
            serialize(modelJson);
            console.log(modelJson);
            window.api.saveLayout(modelJson);
        }}>Save Layout</button>
        <Dropdown
            label={"Language"}
            list={LANGUAGES}
            displayed={state.language}
            setDisplayed={(idx) => { window.api.change(state.currentProblem, LANGUAGES[idx]) }}
        />
    </div>
}