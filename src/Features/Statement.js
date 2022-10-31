import React, { useContext, useEffect, useState, useRef } from "react";
import { appContext } from "../App";
import WebViewer from "@pdftron/webviewer";
export default function Statement() {
  const { state } = useContext(appContext);
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  useEffect(() => {
    if (state.website !== "practice")
      WebViewer(
        {
          path: "./lib",
        },
        viewer.current
      ).then((obj) => {
        const { documentViewer } = obj.Core;
        documentViewer.addEventListener("documentLoaded", () => {
          obj.UI.setFitMode(obj.UI.FitMode.FitWidth);
        });
        setInstance(obj);
        if (state.currentProblem !== null && state.website !== "practice")
          obj.loadDocument(state.problemList[state.currentProblem].statement);
      });
  }, []);
  useEffect(() => {
    if (instance && state.website !== "practice")
      instance.loadDocument(state.problemList[state.currentProblem].statement);
  }, [state.currentProblem]);
  return (
    <div
      className="webviewer"
      style={{ height: "100%", width: "100%" }}
      ref={viewer}
    >
      {state.website === "practice"
        ? "No statement available in practice mode"
        : ""}
    </div>
  );
}
