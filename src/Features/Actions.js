import {
  Build,
  DoneAll,
  PlayCircleFilledOutlined,
  ReplayRounded,
  SaveAs,
  UploadFileRounded,
} from "@mui/icons-material";
import { Container } from "@mui/material";
import { useContext } from "react";
import useKeyboardShortcut from "use-keyboard-shortcut";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";

import { serialize } from "../utils/functions";
export default function Actions({ model }) {
  const { state } = useContext(appContext);

  const reset = () => {
    window.api.reset();
  };

  const compile = () => {
    window.api.compile();
  };

  const run = () => {
    window.api.run();
  };

  const submit = () => {
    window.api.submit();
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
            window.api.change(e.target.value, state.currentLanguage);
          }}
          value={state.currentProblem}
          label={"Currently solving"}
          items={state.problemList.map((problem) => problem.id)}
          fullwidth={true}
        />
        <Dropdown
          handleChange={(e) => {
            window.api.change(state.currentProblem, e.target.value);
          }}
          value={state.currentLanguage}
          label={"Language"}
          items={state.config.languages.map((lang) => lang.name)}
          fullwidth={true}
        />
      </Container>
    </div>
  );
}
