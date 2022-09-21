import { useContext, useEffect } from "react";
import axios from "axios";
import { appContext } from "../App";
import { CHANGE_SUBMISSIONS } from "../utils/constants";
import { getColor } from "../utils/functions";
export default function Submissions() {
    const { state, dispatch } = useContext(appContext);
    return <div className="submissions">
        <table>
            <tr>
                <th>Problem Id</th>
                <th>Time</th>
                <th>Verdict</th>
                <th>Tests Passed</th>
            </tr>
            {state.submissions.length === 0 && <p>No state.submissions found.</p>}
            {Array.from(state.submissions).map((item) => {
                let t = new Date(item.time);
                let tim = t.toTimeString();
                return (
                    <tr>
                        <td>{item.problemId}</td>
                        <td>{tim}</td>
                        <td
                            style={{
                                backgroundColor: getColor(item.verdict),
                            }}
                        >
                            {item.verdict}
                        </td>
                        <td>{item.testsPassed}</td>
                    </tr>
                );
            })}
        </table>
    </div>
}