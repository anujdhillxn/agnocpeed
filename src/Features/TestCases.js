import { Box, IconButton, Tab, Tabs, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { appContext } from "../App";
import { countPassed, getColor, isOk } from "../utils/functions";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../Components/CustomButton";
import { CheckCircleRounded, Clear } from "@mui/icons-material";
export default function TestCases() {
  const { state } = useContext(appContext);
  const [currentTestCase, setCurrentTestCase] = useState(0);

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <CustomButton
          title={"Add New Test Case"}
          handleClick={() => {
            window.api.addNewTestCase(state.problemList[state.currentProblem]);
          }}
        >
          <AddIcon />
        </CustomButton>
        <span>
          Passed -{" "}
          {countPassed(
            state.problemDetails[state.problemList[state.currentProblem]]
              .testCases
          )}{" "}
          /
          {
            state.problemDetails[state.problemList[state.currentProblem]]
              .testCases.length
          }
        </span>
        {countPassed(
          state.problemDetails[state.problemList[state.currentProblem]]
            .testCases
        ) ===
          state.problemDetails[state.problemList[state.currentProblem]]
            .testCases.length && <CheckCircleRounded color="success" />}
      </Box>
      {state.currentProblem === null ||
      state.problemList === null ||
      state.problemDetails === null ||
      !(state.problemList[state.currentProblem] in state.problemDetails) ||
      !state.problemDetails[state.problemList[state.currentProblem]]
        .testCases ||
      state.problemDetails[state.problemList[state.currentProblem]].testCases
        .length === 0 ? (
        <div>No test cases found</div>
      ) : (
        <div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={currentTestCase}
              onChange={(event, newValue) => {
                setCurrentTestCase(newValue);
              }}
            >
              {state.problemDetails[state.problemList[state.currentProblem]][
                "testCases"
              ].map((item, idx) => (
                <Tab
                  sx={{
                    borderTop: item.verdict
                      ? `2px solid ${isOk(item) ? "lightgreen" : "red"}`
                      : "none",
                  }}
                  key={idx}
                  label={
                    <span>
                      {idx + 1}{" "}
                      <IconButton
                        component="div"
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.api.deleteTestCase(idx);
                        }}
                      >
                        <Clear />
                      </IconButton>
                    </span>
                  }
                />
              ))}
            </Tabs>
          </Box>
          <div className="test-case" style={{ display: "flex" }}>
            <div className="input">
              <TextField
                maxRows={18}
                multiline
                margin="normal"
                label={"Input"}
                value={
                  state.problemDetails[state.problemList[state.currentProblem]]
                    .testCases[currentTestCase].input
                }
                onChange={(e) => {
                  window.api.changeTestCases(
                    currentTestCase,
                    "input",
                    e.target.value
                  );
                }}
              />
            </div>
            <div className="output">
              <TextField
                maxRows={18}
                multiline
                margin="normal"
                label={"Expected output"}
                value={
                  state.problemDetails[state.problemList[state.currentProblem]]
                    .testCases[currentTestCase].output
                }
                onChange={(e) => {
                  window.api.changeTestCases(
                    currentTestCase,
                    "output",
                    e.target.value
                  );
                }}
              />
            </div>
            <div className="result">
              <TextField
                maxRows={18}
                multiline
                margin="normal"
                label={"Your output"}
                value={
                  state.problemDetails[state.problemList[state.currentProblem]]
                    .testCases[currentTestCase].result
                }
                disabled
              />
            </div>
          </div>
          <div className="comments">
            <p>
              {
                state.problemDetails[state.problemList[state.currentProblem]]
                  .testCases[currentTestCase].comments
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
