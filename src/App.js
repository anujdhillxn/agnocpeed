import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { ReactNotifications } from "react-notifications-component";
import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css"
import "react-notifications-component/dist/theme.css";
import "./App.scss";
import TestCases from "./Features/TestCases";
import { reducer } from "./utils/functions";
import { CHANGE_PROBLEM_DETAILS, CHANGE_SERVER_MESSAGE, LANGUAGES, APP_LAYOUT, INITIAL_STATE, CHANGE_STATE, CHANGE_PROBLEM, CHANGE_PROBLEM_LIST, CHANGE_CONTEST_ID, CHANGE_WEBSITE } from "./utils/constants";
import { Store } from "react-notifications-component";
import notification from './Components/notif';
import Selection from "./Features/Selection";

export const appContext = React.createContext(null);

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const [model, setModel] = useState(FlexLayout.Model.fromJson(APP_LAYOUT));

  useEffect(() => {

    window.api.getCurrentProblem((data) => {
      dispatch({ type: CHANGE_PROBLEM, payload: data });
    });

    window.api.getProblemList((data) => {
      dispatch({ type: CHANGE_PROBLEM_LIST, payload: data });
    });

    window.api.getProblemDetails((data) => {
      dispatch({ type: CHANGE_PROBLEM_DETAILS, payload: data });
    });

    window.api.getCurrentProblem((data) => {
      dispatch({ type: CHANGE_PROBLEM, payload: data });
    });

    window.api.getLog((data) => {
      dispatch({ type: CHANGE_SERVER_MESSAGE, payload: data });
    });

    window.api.getContestId((data) => {
      dispatch({ type: CHANGE_CONTEST_ID, payload: data });
      window.api.change(0, LANGUAGES[0]);
    });

    window.api.getWebsite((data) => {
      dispatch({ type: CHANGE_WEBSITE, payload: data });
    });

    window.api.notif((data) => {
      Store.addNotification({
        ...notification,
        title: "Compilation result",
        message: data ? "See the logs" : "Compiled successfully",
        type: data ? "danger" : "success",
      });
    })
  }, []);


  const factory = (node) => {
    const Component = node.getComponent();
    if (Component === "text") {
      return (<div className="panel">Panel {node.getName()}</div>);
    }
    return <Component />

  }

  return (
    <appContext.Provider value={{ state: state, dispatch: dispatch }}>
      <div className="App">
        <ReactNotifications />
        {state.contestId == null || state.website == null ?
          <Selection />
          :
          <FlexLayout.Layout
            model={model}
            factory={factory} />
        }
        <TestCases />
      </div>
    </appContext.Provider>

  );
}

