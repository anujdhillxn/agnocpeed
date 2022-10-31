import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function Dropdown(props) {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={props.value}
        label={props.label}
        onChange={props.handleChange}
      >
        {props.items.map((item, idx) => (
          <MenuItem value={idx} key={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
