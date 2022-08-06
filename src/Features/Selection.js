import axios from "axios";
import { useState, useContext } from "react";
import { appContext } from "../App";
import Dropdown from "../Components/Dropdown";
import { CHANGE_BROWSER_READY, CHANGE_CONTEST_READY, CHANGE_PROBLEM, CHANGE_PROBLEM_LIST, PLATFORM_NAMES } from "../utils/constants";

// const puppeteer = window.require("puppeteer");
export default function Selection() {

  const { state, dispatch } = useContext(appContext);

  const [startMessage, setStartMessage] = useState("");
  const [contestBox, setContestBox] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platformBox, setPlatformBox] = useState(0);

  let initiateContest = async () => {
    try {
      // const browser = await puppeteer.launch({ headless: false });
      // const page = await browser.newPage();
      // (await page).goto("https://codeforces.com/enter?back=%2F");
      // await page.waitForSelector("#handleOrEmail");
      // await page.type("#handleOrEmail", "username");
      // await page.type("#password", "password");
      setStartMessage("Fetching list of problems.");
      let resp = await axios.get(`http://127.0.0.1:5000/start/${contestBox}`);
      console.log(resp.data);
      const problems = resp.data.problemList;
      dispatch({ type: CHANGE_PROBLEM_LIST, payload: problems });
      if (problems.length > 0) {
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
      console.log(window.api);
      setStartMessage("Logging in.");
      await axios.post(
        `http://127.0.0.1:5000/login/${PLATFORM_NAMES[platformBox]}`,
        { username: username, password: password }
      );
      setStartMessage("Logged in successfully.");
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
