import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext } from "react";
import { appContext } from "../App";
import CustomTableBodyCell from "../Components/CustomTableBodyCell";
import { getColor } from "../utils/functions";
export default function Submissions() {
  const { state } = useContext(appContext);
  return (
    <div style={{ padding: "10px" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Problem</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Verdict</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(state.submissions).map((row) => (
              <TableRow key={row.time}>
                <CustomTableBodyCell>{row.problemId}</CustomTableBodyCell>
                <CustomTableBodyCell>{row.time}</CustomTableBodyCell>
                <CustomTableBodyCell color={getColor(row.verdict)}>
                  {row.verdict}
                </CustomTableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
