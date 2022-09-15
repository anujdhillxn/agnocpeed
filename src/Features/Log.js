import { useContext } from "react"
import { appContext } from "../App"
import { CHANGE_SERVER_MESSAGE } from "../utils/constants";

export default function Log() {
    const { state, dispatch } = useContext(appContext);
    return <div className="compile-message">
        <button onClick={() => {
            dispatch({ type: CHANGE_SERVER_MESSAGE, payload: "" });
        }}>Clear</button>
        <code>{state.log}</code>
    </div>
}