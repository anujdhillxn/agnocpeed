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
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";

import { serialize } from "../utils/functions";
export default function Actions({ model }) {
  const { state } = useContext(appContext);

  const verifyCode = async () => {};

  return (
    <div className="actions">
      <Container>
        <CustomButton
          title={"Reset Code"}
          handleClick={() => {
            window.api.reset();
          }}
        >
          <ReplayRounded />
        </CustomButton>
        <CustomButton
          title={"Compile"}
          handleClick={() => {
            window.api.compile();
          }}
        >
          <Build />
        </CustomButton>
        <CustomButton
          title={"Run"}
          handleClick={() => {
            window.api.run();
          }}
        >
          <PlayCircleFilledOutlined />
        </CustomButton>
        <CustomButton
          title={"Submit"}
          handleClick={() => {
            window.api.submit();
          }}
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
          items={state.problemList}
          fullwidth={true}
        />
        <Dropdown
          handleChange={(e) => {
            window.api.change(state.currentProblem, e.target.value);
          }}
          value={state.currentLanguage}
          label={"Language"}
          items={Object.keys(state.config.languages)}
          fullwidth={true}
        />
      </Container>
    </div>
  );
}
