import { Clear } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import { CHANGE_SERVER_MESSAGE } from "../utils/constants";

export default function Log() {
  const clearLog = () => {
    window.api.clearLog();
  };

  const { state } = useContext(appContext);
  return (
    <div className="compile-message">
      <code style={{ whiteSpace: "pre-line" }}>
        {" "}
        <CustomButton title={"Clear Log"} handleClick={clearLog}>
          <Clear />
        </CustomButton>
        {state.log}
      </code>
    </div>
  );
}
