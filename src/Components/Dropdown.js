import {
  faChevronDown,
  faChevronUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { React, useState } from "react";

export default function Dropdown({ list, label, displayed, setDisplayed }) {
  const [dropdownStatus, setDropdownStatus] = useState(false);
  const alterDropdownStatus = () => {
    setDropdownStatus(!dropdownStatus);
  };
  return (
    <div className="dropdown">
      <div className="dropdown-clickable">
        <label>{label}:&emsp;</label>
        <button
          type="button"
          className="dropdown-header"
          onClick={alterDropdownStatus}
        >
          {list[displayed]}&emsp;
          <FontAwesomeIcon
            style={{
              color: "#666666",
              position: "absolute",
              top: "2px",
              right: "1px",
            }}
            className="dropdown-icon"
            icon={dropdownStatus ? faChevronUp : faChevronDown}
          />
        </button>
        {dropdownStatus && (
          <div role="list" className="dd-list">
            {list.map((item, idx) => (
              <button
                type="button"
                className="dd-list-item"
                onClick={() => {
                  setDisplayed(idx);
                  alterDropdownStatus();
                }}
                key={idx}
              >
                {item}{" "}
                {displayed === idx ? <FontAwesomeIcon icon={faCheck} /> : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
