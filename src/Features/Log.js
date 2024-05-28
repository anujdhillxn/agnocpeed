import { Clear } from "@mui/icons-material";
import { useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
export default function Log() {
    const clearLog = () => {
        window.api.clearLog();
    };
    const { state } = useContext(appContext);
    const lines = state.log.split("\n");
    return (
        <>
            {" "}
            <CustomButton title={"Clear Log"} handleClick={clearLog}>
                <Clear />
            </CustomButton>{" "}
            <div>
                <code style={{ whiteSpace: "pre-line" }}>
                    <ul>
                        {lines
                            .filter((line) => line.trim() !== "")
                            .map((line) => (
                                <li>{line}</li>
                            ))}
                    </ul>
                </code>
            </div>
        </>
    );
}
