import { useContext } from "react";
import { appContext } from "../App";
import { CHANGE_PROBLEM_DETAILS } from "../utils/constants";
import { getColor } from "../utils/functions";

export default function TestCases() {
  const { state, dispatch } = useContext(appContext);
  if (
    state.currentProblem === null ||
    state.problemList === null ||
    state.problemDetails === null ||
    !(state.problemList[state.currentProblem] in state.problemDetails)
  )
    return <div>No test cases found</div>;
  else {
    return (
      <div className="test-cases">
        {state.problemDetails[state.problemList[state.currentProblem]]["testCases"].map(
          (item, idx) => {
            return (
              <div className="test-case">
                <div className="input">
                  <label>Input: </label>
                  <textarea
                    value={item.input}
                    onChange={(e) => {
                      let newDetails = { ...state.problemDetails };
                      newDetails[state.problemList[state.currentProblem]]["testCases"][
                        idx
                      ]["input"] = e.target.value;
                      dispatch({ type: CHANGE_PROBLEM_DETAILS, payload: newDetails });
                    }}
                  ></textarea>
                </div>
                <div className="output">
                  <label>Expected output: </label>
                  <textarea
                    value={item.output}
                    onChange={(e) => {
                      let newDetails = { ...state.problemDetails };
                      newDetails[state.problemList[state.currentProblem]]["testCases"][
                        idx
                      ]["output"] = e.target.value;
                      dispatch({ type: CHANGE_PROBLEM_DETAILS, payload: newDetails });
                    }}
                  ></textarea>
                </div>
                <div className="result">
                  <label>Your Output: </label>
                  <textarea value={item.result} readOnly></textarea>
                </div>
                <div className="verdict">
                  <p
                    style={{
                      backgroundColor: getColor(item.verdict),
                    }}
                  >
                    {item.verdict}
                  </p>
                </div>
                <div className="comments">
                  <p>{item.comments}</p>
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  }
}
