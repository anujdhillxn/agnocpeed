import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Dropdown from "./Dropdown";

export default function CustomInput(props) {
    const ref = useRef(null);
    const [cursor, setCursor] = useState(null);
    useEffect(() => {
        if (!ref || !ref.current || !ref.current.children) return;
        const input = ref.current.children[0];
        if (input) {
            input.setSelectionRange(cursor, cursor);
        }
    }, [ref, cursor, props.value]);

    return typeof props.value === "number" ? (
        <Dropdown
            id={props.id}
            label={props.label}
            value={props.value}
            items={["No", "Yes"]}
            handleChange={props.handleChange}
        />
    ) : (
        <FormControl variant="outlined" margin="normal">
            <InputLabel htmlFor={props.id}>{props.label}</InputLabel>
            <OutlinedInput
                maxRows={18}
                multiline={props.multiline}
                disabled={props.disabled}
                ref={ref}
                id={props.id}
                label={props.label}
                value={props.value}
                onChange={(e) => {
                    setCursor(e.target.selectionStart);
                    props.handleChange && props.handleChange(e);
                }}
            />
        </FormControl>
    );
}
