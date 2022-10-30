import { FormControl, InputLabel, OutlinedInput } from "@mui/material";

export default function CustomInput(props) {
  return (
    <FormControl variant="outlined" margin="normal">
      <InputLabel htmlFor={props.id}>{props.label}</InputLabel>
      <OutlinedInput
        id={props.id}
        label={props.label}
        value={props.value}
        onChange={props.handleChange}
      />
    </FormControl>
  );
}
