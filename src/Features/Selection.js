import axios from "axios";
import { useState, useContext } from "react";
import { appContext } from "../App";
import Dropdown from "../Components/Dropdown";
import { CHANGE_BROWSER_READY, CHANGE_CONTEST_READY, CHANGE_PROBLEM, CHANGE_PROBLEM_LIST, PLATFORM_NAMES } from "../utils/constants";

export default function Selection() {

  const { state, dispatch } = useContext(appContext);

  const [startMessage, setStartMessage] = useState("");
  const [contestBox, setContestBox] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platformBox, setPlatformBox] = useState(0);

  let initiateContest = async () => {
    try {
      setStartMessage("Fetching list of problems.");
      let resp = await window.api.start(contestBox);
      const problems = resp.problemList;
      console.log(resp);
      dispatch({ type: CHANGE_PROBLEM_LIST, payload: problems });
      if (resp.status) {
        dispatch({ type: CHANGE_PROBLEM, payload: 0 });
        dispatch({ type: CHANGE_CONTEST_READY, payload: true });
      }
      setStartMessage(`${state.problemList.length} problems found.`);

    } catch (e) {
      console.log(e);
    }
  };

  let login = async () => {
    try {

      setStartMessage("Logging in.");
      const response = await window.api.login(username, password, PLATFORM_NAMES[platformBox]);
      setStartMessage(response.message);
      if (response.status)
        dispatch({ type: CHANGE_BROWSER_READY, payload: true });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="selection">
      <div className="selection-wrapper">
        <div className="login">
          <div>
            <label>Enter Username: </label>
            <input
              value={username}
              name="username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <label>Enter Password: </label>
            <input
              value={password}
              name="password"
              type="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <Dropdown
              list={PLATFORM_NAMES}
              label={"Select Platform"}
              displayed={platformBox}
              setDisplayed={setPlatformBox}
            />
          </div>
          <button onClick={login}>Login</button>
        </div>
        <div className="contest">
          <div>
            <label>Enter Contest ID: </label>
            <input
              value={contestBox}
              name="contestId"
              onChange={(e) => {
                setContestBox(e.target.value);
              }}
            ></input>
          </div>
          <button onClick={initiateContest}>Start</button>
        </div>
        <div className="status">{startMessage}</div>
      </div>
    </div>

  );
}
