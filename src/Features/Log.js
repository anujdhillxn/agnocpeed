import { Clear } from "@mui/icons-material";
import { useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
export default function Log() {
  const clearLog = () => {
    window.api.clearLog();
  };

  const { state } = useContext(appContext);
  return (
    <div style={{ border: "1px solid black" }}>
      <code style={{ whiteSpace: "pre-line" }}>
        <CustomButton title={"Clear Log"} handleClick={clearLog}>
          <Clear />
        </CustomButton>
        {state.log}
      </code>
    </div>
  );
}
