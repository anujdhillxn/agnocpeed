import axios from "axios";
import { useState, useContext, useEffect } from "react";
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
  useEffect(() => {
    window.api.getLoginMessage((data) => {
      setStartMessage(data);
    });
  }, []);

  let initiateContest = async () => {
    try {
      window.api.start(contestBox);
    } catch (e) {
      console.log(e);
    }
  };

  let login = async () => {
    try {
      window.api.login(username, password, PLATFORM_NAMES[platformBox]);

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
