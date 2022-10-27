import { Login, Start } from "@mui/icons-material";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import Dropdown from "../Components/Dropdown";
import { PLATFORM_NAMES } from "../utils/constants";

export default function Selection() {
  const { state } = useContext(appContext);
  const [startMessage, setStartMessage] = useState("");
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
        <div className="login">
          <div>
            <FormControl variant="outlined">
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
          </div>
          <div>
            <FormControl variant="outlined">
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
          </div>
          <div>
            <Dropdown
              handleChange={(e) => {
                setPlatformBox(e.target.value);
              }}
              value={platformBox}
              label={"Platform"}
              items={PLATFORM_NAMES}
              fullWidth={true}
            />
          </div>
          <CustomButton title={"Login"} handleClick={login}>
            <Login />
          </CustomButton>
        </div>
        <div className="contest">
          <div>
            <FormControl variant="outlined" margin="normal">
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
          </div>
          <CustomButton title={"Start Contest"} handleClick={initiateContest}>
            <Start />
          </CustomButton>
        </div>
        <div className="status">{startMessage}</div>
      </div>
    </div>
  );
}
