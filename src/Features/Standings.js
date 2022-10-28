import { List, ListItem } from "@mui/material";
import { Box } from "@mui/system";
import { useContext } from "react";
import { appContext } from "../App";

export default function Standings() {
  const { state } = useContext(appContext);
  if (state.standings) {
    return (
      <Box>
        <List>
          <ListItem>Current rank - {state.standings.rank}</ListItem>
          <ListItem>Accepted / Tried</ListItem>
          {Object.keys(state.standings.solve).map((problemId) => (
            <ListItem key={problemId}>
              {problemId}: {state.standings.solve[problemId]}
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }
  return <Box>Waiting for rank updates...</Box>;
}
