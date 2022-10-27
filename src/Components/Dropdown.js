import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function Dropdown(props) {
  return (
    <FormControl fullWidth margin="dense">
      <InputLabel>{props.label}</InputLabel>
      <Select
        size="small"
        value={props.value}
        label={props.label}
        onChange={props.handleChange}
      >
        {props.items.map((item, idx) => (
          <MenuItem value={idx}>{item}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
