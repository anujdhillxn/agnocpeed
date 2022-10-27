import {
  Build,
  DoneAll,
  PlayCircleFilledOutlined,
  ReplayRounded,
  SaveAs,
  UploadFile,
  UploadFileRounded,
} from "@mui/icons-material";
import { Box, Button, ButtonGroup, Container } from "@mui/material";
import { useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";
import {
  CHANGE_LANGUAGE,
  CHANGE_PROBLEM,
  CHANGE_PROBLEM_DETAILS,
  CHANGE_SERVER_MESSAGE,
  LANGUAGES,
} from "../utils/constants";
import { serialize } from "../utils/functions";
export default function Actions({ model }) {
  const { state, dispatch } = useContext(appContext);

  const verifyCode = async () => {
    try {
    } catch (e) {
      dispatch({ type: CHANGE_SERVER_MESSAGE, payload: e });
    }
  };

  return (
    <div className="actions">
      <Container>
        {" "}
        <CustomButton
          title={"Reset Code"}
          handleClick={() => {
            window.api.reset(
              state.problemList[state.currentProblem],
              LANGUAGES[state.language]
            );
          }}
        >
          <ReplayRounded />
        </CustomButton>
        <CustomButton
          title={"Compile"}
          handleClick={() => {
            window.api.compile(
              state.problemList[state.currentProblem],
              LANGUAGES[state.language]
            );
          }}
        >
          <Build />
        </CustomButton>
        <CustomButton
          title={"Run"}
          handleClick={() => {
            window.api.run(
              state.problemList[state.currentProblem],
              LANGUAGES[state.language]
            );
          }}
        >
          <PlayCircleFilledOutlined />
        </CustomButton>
        <CustomButton
          title={"Submit"}
          handleClick={() => {
            window.api.submit(
              state.problemList[state.currentProblem],
              LANGUAGES[state.language]
            );
          }}
        >
          <UploadFileRounded />
        </CustomButton>
        <CustomButton title={"Verify"} handleClick={verifyCode}>
          <DoneAll />
        </CustomButton>
        <CustomButton
          title={"Save Layout"}
          handleClick={() => {
            let modelJson = model.toJson();
            serialize(modelJson);
            console.log(modelJson);
            window.api.saveLayout(modelJson);
          }}
        >
          <SaveAs />
        </CustomButton>
      </Container>
      <Container>
        <Dropdown
          handleChange={(e) => {
            window.api.change(e.target.value, LANGUAGES[state.language]);
          }}
          value={state.currentProblem}
          label={"Currently solving"}
          items={state.problemList}
          fullwidth={true}
        />
        <Dropdown
          handleChange={(e) => {
            window.api.change(state.currentProblem, LANGUAGES[e.target.value]);
          }}
          value={state.language}
          label={"Language"}
          items={LANGUAGES}
          fullwidth={true}
        />
      </Container>
    </div>
  );
}
