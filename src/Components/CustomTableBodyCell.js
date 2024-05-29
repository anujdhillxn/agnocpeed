import { TableCell } from "@mui/material";

export default function CustomTableBodyCell(props) {
    return (
        <TableCell
            component="th"
            scope="row"
            sx={{ fontSize: "12px", padding: "4px", color: props.color }}
        >
            {props.children}
        </TableCell>
    );
}
