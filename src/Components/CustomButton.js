import { IconButton, Tooltip } from "@mui/material";

export default function CustomButton(props) {
    return (
        <Tooltip title={props.title}>
            <IconButton
                onClick={props.handleClick}
                size="small"
                variant="contained"
            >
                {props.children}
            </IconButton>
        </Tooltip>
    );
}
