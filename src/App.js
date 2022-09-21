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
import Submissions from "./Features/Submissions";
import Actions from "./Features/Actions";
import Log from "./Features/Log";
import Statement from "./Features/Statement";

export const appContext = React.createContext(null);

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [model, setModel] = useState(FlexLayout.Model.fromJson(APP_LAYOUT));
  useEffect(() => {

    window.api.getConfig((data) => {
      console.log(data);
      if (data.layout);
      setModel(FlexLayout.Model.fromJson(data.layout));
    });

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
        title: data.message,
        message: data.message,
        type: data.danger ? "danger" : "success",
      });
    })
  }, []);


  const factory = (node) => {
    const name = node.getName();
    if (name === "Standings") {
      return (<div className="panel">Panel {node.getName()}</div>);
    }
    if (name === "Actions") return <Actions model={model} />
    else if (name === "Log") return <Log />
    else if (name === "Submissions") return <Submissions />
    else if (name === "Statement") return <Statement />
    else return <TestCases />
  }

  return (
    <appContext.Provider value={{ state: state, dispatch: dispatch }}>
      <div className="App">
        <ReactNotifications />
        {state.contestId == null || state.website == null || !state.problemList ?
          <Selection />
          :
          <FlexLayout.Layout
            model={model}
            factory={factory} />

        }
      </div>
    </appContext.Provider>

  );
}

