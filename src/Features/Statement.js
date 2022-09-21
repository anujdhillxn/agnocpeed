import React, { useContext } from "react";
import { appContext } from "../App";

export default function Statement() {
    const { state } = useContext(appContext);

    console.log(`file://${state.problemDetails[state.problemList[state.currentProblem]].problemStatement}`);
    return <div><object data={`file://${state.problemDetails[state.problemList[state.currentProblem]].problemStatement}`} type="application/pdf" width="100%" height="720">
    </object></div>
}