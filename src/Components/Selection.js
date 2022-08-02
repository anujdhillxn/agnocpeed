import axios from "axios";
import { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
export default function Selection({
  setProblemDetails,
  setProblemList,
  setCurrentProblem,
  setServerMessage,
}) {
  const platformNames = ["codeforces", "atcoder", "codechef", "practice"];
  const [contestBox, setContestBox] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platformBox, setPlatformBox] = useState(0);
  const [stats, setStats] = useState("");
  let initiateContest = async () => {
    try {
      setServerMessage("Fetching list of problems.");
      let resp = await axios.get(`http://127.0.0.1:5000/start/${contestBox}`);
      console.log(resp.data);
      setProblemList(resp.data.problemList);
      setCurrentProblem(0);
      setServerMessage(`${resp.data.problemList.length} problems found.`);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await axios.get("http://127.0.0.1:5000/standings");
      setStats(resp.data.stats);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  let login = async () => {
    try {
      setServerMessage("Logging in.");
      await axios.post(
        `http://127.0.0.1:5000/login/${platformNames[platformBox]}`,
        { username: username, password: password }
      );
      setServerMessage("Logged in successfully.");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="headers">
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
            list={platformNames}
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
      <div className="stats">{stats}</div>
    </div>
  );
}
