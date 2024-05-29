import { Clear } from "@mui/icons-material";
import { IconButton, Tab, Tabs } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import { appContext } from "../App";
import CustomButton from "../Components/CustomButton";
import CustomInput from "../Components/CustomInput";
export default function Settings() {
    const { state } = useContext(appContext);
    const [displayedLang, setDisplayedLang] = useState(0);
    return (
        <div style={{ margin: "10px" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                }}
            >
                {Object.keys(state.config).map((key) =>
                    key !== "layout" &&
                    key !== "languages" &&
                    key !== "cookies" ? (
                        <CustomInput
                            id={key}
                            label={key}
                            value={state.config[key]}
                            handleChange={(event) =>
                                window.api.changeConfig(key, event.target.value)
                            }
                        />
                    ) : (
                        ""
                    )
                )}
            </div>
            <Box borderTop={1} borderColor="divider">
                {" "}
                <h3>
                    Languages{" "}
                    <CustomButton
                        title={"Add New Language"}
                        handleClick={() => {
                            window.api.addNewLanguage();
                        }}
                    >
                        <AddIcon />
                    </CustomButton>
                </h3>
                <Tabs
                    value={displayedLang}
                    onChange={(event, newValue) => {
                        setDisplayedLang(newValue);
                    }}
                >
                    {state.config.languages.map((item, idx) => (
                        <Tab
                            key={idx}
                            label={
                                <span>
                                    {item.name}
                                    <IconButton
                                        component="div"
                                        size="small"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (
                                                state.config.languages.length >
                                                    1 &&
                                                displayedLang ===
                                                    state.config.languages
                                                        .length -
                                                        1
                                            )
                                                setDisplayedLang(
                                                    (val) => val - 1
                                                );
                                            window.api.deleteLanguage(idx);
                                        }}
                                    >
                                        <Clear />
                                    </IconButton>
                                </span>
                            }
                        />
                    ))}
                </Tabs>
                <Box>
                    <p>
                        To access contest directory, use -
                        <code>{"{contestDir}"}</code>
                    </p>
                    <p>
                        To access problem ID, use - <code>{"{problemId}"}</code>
                    </p>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3,1fr)",
                        }}
                    >
                        {Object.keys(state.config.languages[displayedLang]).map(
                            (key) => (
                                <CustomInput
                                    id={key}
                                    label={key}
                                    value={
                                        state.config.languages[displayedLang][
                                            key
                                        ]
                                    }
                                    handleChange={(event) =>
                                        window.api.changeLangConfig(
                                            displayedLang,
                                            key,
                                            event.target.value
                                        )
                                    }
                                />
                            )
                        )}
                    </div>
                </Box>
            </Box>
        </div>
    );
}
