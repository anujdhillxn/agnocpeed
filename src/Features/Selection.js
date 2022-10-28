import { Login, Start } from "@mui/icons-material";
import { Box, FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";
import { PLATFORM_NAMES } from "../utils/constants";

export default function Selection() {
  const { state } = useContext(appContext);
  const [startMessage, setStartMessage] = useState(
    "Log in and then choose a contest ID."
  );
  const [contestBox, setContestBox] = useState("");
  const [username, setUsername] = useState(state.config.defaultUsername);
  const [password, setPassword] = useState("");
  const [platformBox, setPlatformBox] = useState(0);
  useEffect(() => {
    window.api.getLoginMessage((data) => {
      setStartMessage(data);
    });
  }, []);

  const initiateContest = () => {
    window.api.start(contestBox);
  };

  const login = () => {
    window.api.login(username, password, PLATFORM_NAMES[platformBox]);
  };

  return (
    <div className="selection">
      <div className="selection-wrapper">
        <FormControl variant="outlined" margin="dense">
          <InputLabel htmlFor="username">Username</InputLabel>
          <OutlinedInput
            fullWidth
            id="username"
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </FormControl>
        <FormControl variant="outlined" margin="dense">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            fullWidth
            value={password}
            label="Password"
            type="password"
            id="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </FormControl>
        <Dropdown
          handleChange={(e) => {
            setPlatformBox(e.target.value);
          }}
          value={platformBox}
          label={"Platform"}
          items={PLATFORM_NAMES}
          fullWidth={true}
        />
        <Box>
          <CustomButton title={"Login"} handleClick={login}>
            <Login />
          </CustomButton>
        </Box>
        <FormControl variant="outlined" margin="dense">
          <InputLabel htmlFor="contest-id">Contest ID</InputLabel>
          <OutlinedInput
            fullWidth
            value={contestBox}
            label="Contest ID"
            id="contest-id"
            onChange={(e) => {
              setContestBox(e.target.value);
            }}
          />
        </FormControl>
        <Box>
          <CustomButton title={"Start Contest"} handleClick={initiateContest}>
            <Start />
          </CustomButton>
        </Box>
        <Box className="status">{startMessage}</Box>
      </div>
    </div>
  );
}
