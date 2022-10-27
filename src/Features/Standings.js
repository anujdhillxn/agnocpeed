import { List, ListItem } from "@mui/material";
import { useContext } from "react";
import { appContext } from "../App";

export default function Standings() {
  const { state } = useContext(appContext);
  if (state.standings) {
    return (
      <div className="standings">
        <List>
          <ListItem>Current rank - {state.standings.rank}</ListItem>
          <ListItem>Accepted / Tried</ListItem>
          {Object.keys(state.standings.solve).map((problemId) => (
            <ListItem key={problemId}>
              {problemId}: {state.standings.solve[problemId]}
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
  return <div>Waiting for rank updates...</div>;
}
