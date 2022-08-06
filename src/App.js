import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { ReactNotifications } from "react-notifications-component";
import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css"
import "react-notifications-component/dist/theme.css";
import "./App.scss";

import { reducer } from "./utils/functions";
import { CHANGE_PROBLEM_DETAILS, CHANGE_SERVER_MESSAGE, INITIAL_STATE, LANGUAGES, APP_LAYOUT } from "./utils/constants";

import Selection from "./Features/Selection";

export const appContext = React.createContext(null);

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const [model, setModel] = useState(FlexLayout.Model.fromJson(APP_LAYOUT));

  useEffect(() => {
    const changeProblem = async () => {
      try {

        dispatch({ type: CHANGE_SERVER_MESSAGE, payload: `Fetching testcases for ${state.problemList[state.currentProblem]}` })
        if (state.currentProblem < state.problemList.length) {
          let resp = await axios.get(
            `http://127.0.0.1:5000/change/${state.problemList[state.currentProblem]}/${LANGUAGES[state.language]}`
          );
          const problemDetails = resp.data.problemDetails;
          dispatch({ type: CHANGE_PROBLEM_DETAILS, payload: problemDetails });
        }
        dispatch({ type: CHANGE_SERVER_MESSAGE, payload: `Solving ${state.problemList[state.currentProblem]}` })
      } catch (e) {
        dispatch({ type: CHANGE_SERVER_MESSAGE, payload: `Error while switching to problem ${state.problemList[state.currentProblem]}. Try Again.` });
      }
    };
    if (state.currentProblem != null) changeProblem(state.currentProblem, state.language);
  }, [state.currentProblem, state.language, state.problemList]);

  const factory = (node) => {
    const Component = node.getComponent();
    if (Component === "text") {
      return (<div className="panel">Panel {node.getName()}</div>);
    }
    return <Component />

  }
  console.log(window.api);

  return (
    <appContext.Provider value={{ state: state, dispatch: dispatch }}>
      <div className="App">
        <ReactNotifications />
        {!state.contestReady || !state.browserReady ?
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

