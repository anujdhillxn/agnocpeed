import {
    Build,
    PlayCircleFilledOutlined,
    ReplayRounded,
    UploadFileRounded,
} from "@mui/icons-material";
import { Container } from "@mui/material";
import { useContext } from "react";
import useKeyboardShortcut from "use-keyboard-shortcut";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";

export default function Actions({ model }) {
    const {
        state,
        currentProblem,
        setCurrentProblem,
        currentLanguage,
        setCurrentLanguage,
    } = useContext(appContext);

    const reset = () => {
        window.api.reset(currentProblem, currentLanguage);
    };

    const compile = () => {
        window.api.compile(currentProblem, currentLanguage);
    };

    const run = () => {
        window.api.run(currentProblem, currentLanguage);
    };

    const submit = () => {
        window.api.submit(currentProblem, currentLanguage);
    };
    useKeyboardShortcut(state.config.resetHotKeys.split("+"), reset, {
        repeatOnHold: false,
    });
    useKeyboardShortcut(state.config.compileHotKeys.split("+"), compile, {
        repeatOnHold: false,
    });
    useKeyboardShortcut(state.config.runHotKeys.split("+"), run, {
        repeatOnHold: false,
    });
    useKeyboardShortcut(state.config.submitHotKeys.split("+"), submit, {
        repeatOnHold: false,
    });

    return (
        <div style={{ margin: "10px" }} className="actions">
            <Container>
                <CustomButton
                    title={`Reset (${state.config.resetHotKeys})`}
                    handleClick={reset}
                >
                    <ReplayRounded />
                </CustomButton>
                <CustomButton
                    title={`Compile (${state.config.compileHotKeys})`}
                    handleClick={compile}
                >
                    <Build />
                </CustomButton>
                <CustomButton
                    title={`Run (${state.config.runHotKeys})`}
                    handleClick={run}
                >
                    <PlayCircleFilledOutlined />
                </CustomButton>
                <CustomButton
                    title={`Submit (${state.config.submitHotKeys})`}
                    handleClick={submit}
                >
                    <UploadFileRounded />
                </CustomButton>
            </Container>
            <Container>
                <Dropdown
                    handleChange={(e) => {
                        setCurrentProblem(e.target.value);
                        window.api.change(e.target.value, currentLanguage);
                    }}
                    value={currentProblem}
                    label={"Currently solving"}
                    items={state.problemList.map((problem) => problem.id)}
                    fullwidth={true}
                />
                <Dropdown
                    handleChange={(e) => {
                        setCurrentLanguage(e.target.value);
                        window.api.change(currentProblem, e.target.value);
                    }}
                    value={currentLanguage}
                    label={"Language"}
                    items={state.config.languages.map((lang) => lang.name)}
                    fullwidth={true}
                />
            </Container>
        </div>
    );
}
