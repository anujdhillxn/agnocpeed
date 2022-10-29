import React, { useEffect, useState } from "react";
import { ReactNotifications } from "react-notifications-component";
import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import "react-notifications-component/dist/theme.css";
import TestCases from "./Features/TestCases";
import { INITIAL_STATE, THEME } from "./utils/constants";
import { Store } from "react-notifications-component";
import notification from "./Components/notif";
import Selection from "./Features/Selection";
import Submissions from "./Features/Submissions";
import Actions from "./Features/Actions";
import Log from "./Features/Log";
import Statement from "./Features/Statement";
import Standings from "./Features/Standings";
import { Box, ThemeProvider } from "@mui/material";
import { serialize } from "./utils/functions";

export const appContext = React.createContext(null);

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [model, setModel] = useState(null);

  useEffect(() => {
    window.api.getState((data) => {
      setState(data);
      if (data.config.layout)
        setModel(FlexLayout.Model.fromJson(data.config.layout));
    });
    window.api.notif((data) => {
      Store.addNotification({
        ...notification,
        title: data.message,
        message: data.message,
        type: data.danger ? "danger" : "success",
      });
    });
  }, []);

  const factory = (node) => {
    const name = node.getName();
    if (name === "Standings") return <Standings />;
    else if (name === "Actions") return <Actions model={model} />;
    else if (name === "Log") return <Log />;
    else if (name === "Submissions") return <Submissions />;
    else if (name === "Statement") return <Statement />;
    else return <TestCases />;
  };

  useEffect(() => {
    console.log(state);
  }, [state]);
  return (
    <appContext.Provider value={{ state: state }}>
      <ThemeProvider theme={THEME}>
        {state.config === null ? (
          <Box>Loading config...</Box>
        ) : (
          <div className="App">
            <ReactNotifications />
            {state.contestId == null ||
            state.website == null ||
            !state.problemList ||
            state.currentProblem === null ? (
              <Selection />
            ) : (
              <FlexLayout.Layout
                onModelChange={() => {
                  let modelJson = model.toJson();
                  serialize(modelJson);
                  window.api.saveLayout(modelJson);
                }}
                font={{ family: "'Montserrat', sans-serif" }}
                model={model}
                factory={factory}
              />
            )}
          </div>
        )}
      </ThemeProvider>
    </appContext.Provider>
  );
}
