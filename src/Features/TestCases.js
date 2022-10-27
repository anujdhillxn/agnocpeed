import { Button, Fab, TextField } from "@mui/material";
import { useContext } from "react";
import { appContext } from "../App";
import { CHANGE_PROBLEM_DETAILS } from "../utils/constants";
import { getColor } from "../utils/functions";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../Components/CustomButton";
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
      <div>
        <CustomButton
          title={"Add New Test Case"}
          handleClick={() => {
            window.api.addNewTestCase(state.problemList[state.currentProblem]);
          }}
        >
          <AddIcon />
        </CustomButton>
        <div
          className="test-cases"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {state.problemDetails[state.problemList[state.currentProblem]][
            "testCases"
          ].map((item, idx) => {
            return (
              <div className="test-case" style={{ display: "flex" }}>
                <div className="input">
                  <TextField
                    rows={7}
                    multiline
                    margin="normal"
                    label={"Input"}
                    value={item.input}
                    onChange={(e) => {
                      window.api.changeTestCases(
                        state.problemList[state.currentProblem],
                        idx,
                        "input",
                        e.target.value
                      );
                    }}
                  />
                </div>
                <div className="output">
                  <TextField
                    rows={7}
                    multiline
                    margin="normal"
                    label={"Expected output"}
                    value={item.output}
                    onChange={(e) => {
                      window.api.changeTestCases(
                        state.problemList[state.currentProblem],
                        idx,
                        "output",
                        e.target.value
                      );
                    }}
                  />
                </div>
                <div className="result">
                  <TextField
                    rows={7}
                    multiline
                    margin="normal"
                    label={"Your output"}
                    value={item.result}
                    disabled
                  />
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
          })}
        </div>
      </div>
    );
  }
}
