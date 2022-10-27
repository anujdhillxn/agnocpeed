import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useEffect } from "react";
import { appContext } from "../App";
import { CHANGE_SUBMISSIONS } from "../utils/constants";
import { getColor } from "../utils/functions";
export default function Submissions() {
  const { state, dispatch } = useContext(appContext);
  return (
    <div className="submissions" style={{ padding: "10px" }}>
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
              <TableRow key={row.name} sx={{ border: "none" }}>
                <TableCell>{row.problemId}</TableCell>
                <TableCell align="right">{row.time}</TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: getColor(row.verdict) }}
                >
                  {row.verdict}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
