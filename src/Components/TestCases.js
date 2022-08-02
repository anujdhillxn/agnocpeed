export default function TestCases({
  currentProblem,
  problemDetails,
  problemList,
  setProblemDetails,
}) {
  const getColor = (verdict) => {
    if (verdict === "AC" || verdict === "OK") return "lightgreen";
    if (verdict === "WA" || verdict === "WRONG_ANSWER") return "red";
    return "yellow";
  };

  if (
    currentProblem === null ||
    problemList === null ||
    problemDetails === null ||
    !(problemList[currentProblem] in problemDetails)
  )
    return <div>No test cases found</div>;
  else {
    return (
      <div className="test-cases">
        {problemDetails[problemList[currentProblem]]["test_cases"].map(
          (item, idx) => {
            return (
              <div className="test-case">
                <div className="input">
                  <label>Input: </label>
                  <textarea
                    value={item.input}
                    onChange={(e) => {
                      let new_details = { ...problemDetails };
                      new_details[problemList[currentProblem]]["test_cases"][
                        idx
                      ]["input"] = e.target.value;
                      setProblemDetails(new_details);
                    }}
                  ></textarea>
                </div>
                <div className="output">
                  <label>Expected output: </label>
                  <textarea
                    value={item.output}
                    onChange={(e) => {
                      let new_details = { ...problemDetails };
                      new_details[problemList[currentProblem]]["test_cases"][
                        idx
                      ]["output"] = e.target.value;
                      setProblemDetails(new_details);
                    }}
                  ></textarea>
                </div>
                <div className="result">
                  <label>Your Output: </label>
                  <textarea value={item.result} readOnly></textarea>
                </div>
                <div className="verdict">
                  <p
                    style={{
                      backgroundColor: getColor(item.verdict),
                    }}
                  >
                    {item.verdict}
                  </p>
                </div>
                <div className="comments">
                  <p>{item.comments}</p>
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  }
}
