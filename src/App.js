import { useEffect, useState } from "react";
import axios from "axios";
import Selection from "./Components/Selection";
import Dropdown from "./Components/Dropdown";
import TestCases from "./Components/TestCases";
import { ReactNotifications } from "react-notifications-component";
import { Store } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import "./App.scss";
import specs from "./Components/specs";
import notification from "./Components/notif";
function App() {
  const [submissions, setSubmissions] = useState([]);
  const [problemList, setProblemList] = useState([]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [serverMessage, setServerMessage] = useState("");
  const [language, setLanguage] = useState(0);
  // useEffect(() => {
  //   const ws = new WebSocket("ws://127.0.0.1:5000/check");
  //   ws.onopen = (event) => {
  //     ws.send("");
  //   };
  //   ws.onmessage = function (event) {
  //     const resp = JSON.parse(event.data);
  //     setStats(resp.stats);
  //     setSubmissions(resp.submissions);
  //   };
  //   //clean up function
  //   return () => ws.close();
  // }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const resp = await axios.get("http://127.0.0.1:5000/submissions");
      if (resp.data.submissions.length) setSubmissions(resp.data.submissions);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  let compileCode = async () => {
    try {
      setServerMessage("");
      let resp = await axios.get(
        `http://127.0.0.1:5000/compile/${problemList[currentProblem]}/${specs.languages[language]}`
      );
      setServerMessage(resp.data.message);
      Store.addNotification({
        ...notification,
        title: "Compilation result",
        message: resp.data.message ? "See the logs" : "Compiled successfully",
        type: resp.data.message ? "danger" : "success",
      });
    } catch (e) {
      console.log(e);
    }
  };

  let runCode = async () => {
    try {
      problemDetails[problemList[currentProblem]].test_cases.forEach(
        async (item, idx) => {
          let payload = {
            testCase: item,
          };
          let resp = await axios.post(
            `http://127.0.0.1:5000/run/${problemList[currentProblem]}/${specs.languages[language]}`,
            payload
          );
          let newDetails = { ...problemDetails };
          newDetails[problemList[currentProblem]].test_cases[idx]["result"] =
            resp.data.result;
          newDetails[problemList[currentProblem]].test_cases[idx]["comments"] =
            resp.data.comments;
          newDetails[problemList[currentProblem]].test_cases[idx]["verdict"] =
            resp.data.verdict;
          setProblemDetails(newDetails);
        }
      );
    } catch (e) {
      console.log(e);
    }
  };
  let submitCode = async () => {
    try {
      let resp = await axios.get(
        `http://127.0.0.1:5000/submit/${problemList[currentProblem]}`
      );
      Store.addNotification({
        ...notification,
        title: "Submission result",
        message: resp.data.status ? "Submitted successfully" : "Try again",
        type: resp.data.status ? "success" : "danger",
      });
    } catch (e) {
      console.log(e);
    }
  };

  let resetCode = async () => {
    try {
      await axios.get(
        `http://127.0.0.1:5000/reset_code/${problemList[currentProblem]}/${specs.languages[language]}`
      );
    } catch (e) {
      setServerMessage(e);
    }
  };

  let verifyCode = async () => {
    try {
      setServerMessage("Stress testing the solution...");
      let resp = await axios.get(
        `http://127.0.0.1:5000/verify/${problemList[currentProblem]}/${specs.languages[language]}`
      );
      setServerMessage(resp.data.status + resp.data.failedInputs);
    } catch (e) {
      console.log(e);
    }
  };

  const getColor = (verdict) => {
    if (verdict === "AC" || verdict === "OK") return "lightgreen";
    if (verdict === "WA" || verdict === "WRONG_ANSWER" || verdict === "TLE")
      return "red";
    return "yellow";
  };

  useEffect(() => {
    const changeProblem = async () => {
      try {
        setServerMessage(
          `Fetching testcases for ${problemList[currentProblem]}`
        );
        if (currentProblem < problemList.length) {
          let resp = await axios.get(
            `http://127.0.0.1:5000/change/${problemList[currentProblem]}/${specs.languages[language]}`
          );
          setProblemDetails(resp.data.problemDetails);
        }
        setServerMessage(`Solving problem ${problemList[currentProblem]}`);
      } catch (e) {
        setServerMessage(
          `Error while switching to problem ${problemList[currentProblem]}. Try Again.`
        );
      }
    };
    if (currentProblem != null) changeProblem(currentProblem, language);
  }, [currentProblem, language, problemList]);
  return (
    <div className="App">
      <ReactNotifications />
      <div className="contest-and-problem">
        <Selection
          setProblemDetails={setProblemDetails}
          setProblemList={setProblemList}
          setCurrentProblem={setCurrentProblem}
          setServerMessage={setServerMessage}
        />
        <Dropdown
          label={"Language"}
          list={specs.languages}
          displayed={language}
          setDisplayed={setLanguage}
        />
      </div>
      <div className="button-section">
        <Dropdown
          label={"Currently solving"}
          list={problemList}
          displayed={currentProblem}
          setDisplayed={setCurrentProblem}
        />
        <button onClick={resetCode}>Reset Code</button>
        <button onClick={compileCode}>Compile</button>
        <button onClick={runCode}>Run</button>
        <button onClick={submitCode}>Submit</button>
        <button onClick={verifyCode}>Verify</button>
      </div>
      <div className="compile-message">
        <code>{serverMessage}</code>
      </div>
      <TestCases
        currentProblem={currentProblem}
        problemList={problemList}
        problemDetails={problemDetails}
        setProblemDetails={setProblemDetails}
      />
      <div className="submissions">
        <table>
          <tr>
            <th>Problem Id</th>
            <th>Time</th>
            <th>Verdict</th>
            <th>Tests Passed</th>
          </tr>
          {submissions.length === 0 && <p>No submissions found.</p>}
          {Array.from(submissions).map((item) => {
            let t = new Date(item.time);
            let tim = t.toTimeString();
            return (
              <tr>
                <td>{item.problemId}</td>
                <td>{tim}</td>
                <td
                  style={{
                    backgroundColor: getColor(item.verdict),
                  }}
                >
                  {item.verdict}
                </td>
                <td>{item.testsPassed}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}

export default App;
