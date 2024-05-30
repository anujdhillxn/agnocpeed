import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { useContext, useState } from "react";
import { appContext } from "../App";
import { countPassed, isOk } from "../utils/functions";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../Components/CustomButton";
import { CheckCircleRounded, Clear } from "@mui/icons-material";

import useKeyboardShortcut from "use-keyboard-shortcut";
import CustomInput from "../Components/CustomInput";
export default function TestCases() {
    const { state, currentProblem } = useContext(appContext);
    const [currentTestCase, setCurrentTestCase] = useState(0);

    useKeyboardShortcut(
        ["Shift", "ArrowRight"],
        () =>
            setCurrentTestCase((val) =>
                val + 1 < state.problemList[currentProblem].testCases.length
                    ? val + 1
                    : val
            ),
        { repeatOnHold: false }
    );

    useKeyboardShortcut(
        ["Shift", "ArrowLeft"],
        () => setCurrentTestCase((val) => (val - 1 >= 0 ? val - 1 : val)),
        { repeatOnHold: false }
    );

    // useKeyboardShortcut(
    //   ["Shift", "ArrowDown"],
    //   () => {
    //     currentProblem + 1 < state.problemList.length &&
    //       window.api.change(currentProblem + 1, state.currentLanguage);
    //   },
    //   { repeatOnHold: false }
    // );

    // useKeyboardShortcut(
    //   ["Shift", "ArrowUp"],
    //   () => {
    //     currentProblem - 1 >= 0 &&
    //       window.api.change(currentProblem - 1, state.currentLanguage);
    //   },
    //   { repeatOnHold: false }
    // );

    return (
        <div style={{ margin: "10px" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <CustomButton
                    title={"Add New Test Case"}
                    handleClick={() => {
                        window.api.addNewTestCase(currentProblem);
                    }}
                >
                    <AddIcon />
                </CustomButton>
                <span>
                    Passed -{" "}
                    {countPassed(state.problemList[currentProblem].testCases)} /
                    {state.problemList[currentProblem].testCases.length}
                </span>
                {countPassed(state.problemList[currentProblem].testCases) ===
                    state.problemList[currentProblem].testCases.length &&
                    state.problemList[currentProblem].testCases.length > 0 && (
                        <CheckCircleRounded color="success" />
                    )}
            </Box>
            <div>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={currentTestCase}
                        onChange={(event, newValue) => {
                            setCurrentTestCase(newValue);
                        }}
                    >
                        {state.problemList[currentProblem].testCases.map(
                            (item, idx) => (
                                <Tab
                                    sx={{
                                        borderTop: item.verdict
                                            ? `2px solid ${
                                                  isOk(item)
                                                      ? "lightgreen"
                                                      : "red"
                                              }`
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
                                                    if (
                                                        state.problemList[
                                                            currentProblem
                                                        ].testCases.length >
                                                            1 &&
                                                        currentTestCase ===
                                                            state.problemList[
                                                                state
                                                                    .currentProblem
                                                            ].testCases.length -
                                                                1
                                                    )
                                                        setCurrentTestCase(
                                                            (val) => val - 1
                                                        );
                                                    window.api.deleteTestCase(
                                                        currentProblem,
                                                        idx
                                                    );
                                                }}
                                            >
                                                <Clear />
                                            </IconButton>
                                        </span>
                                    }
                                />
                            )
                        )}
                    </Tabs>
                </Box>
                {state.problemList[currentProblem].testCases.length > 0 && (
                    <div>
                        <div className="test-case" style={{ display: "flex" }}>
                            <CustomInput
                                multiline={true}
                                id="input"
                                label={"Input"}
                                value={
                                    state.problemList[currentProblem].testCases[
                                        currentTestCase
                                    ].input
                                }
                                handleChange={(e) => {
                                    window.api.changeTestCases(
                                        currentProblem,
                                        currentTestCase,
                                        "input",
                                        e.target.value
                                    );
                                }}
                            />
                            <CustomInput
                                multiline={true}
                                id="output"
                                label={"Expected output"}
                                value={
                                    state.problemList[currentProblem].testCases[
                                        currentTestCase
                                    ].output
                                }
                                handleChange={(e) => {
                                    window.api.changeTestCases(
                                        currentProblem,
                                        currentTestCase,
                                        "output",
                                        e.target.value
                                    );
                                }}
                            />
                            <CustomInput
                                multiline={true}
                                id="result"
                                label={"Your output"}
                                value={
                                    state.problemList[currentProblem].testCases[
                                        currentTestCase
                                    ].result
                                }
                                disabled={true}
                            />
                        </div>
                        <div className="comments">
                            <p>
                                {
                                    state.problemList[currentProblem].testCases[
                                        currentTestCase
                                    ].comments
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
