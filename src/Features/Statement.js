import React, { useEffect } from "react";

const getRatio = (position) => {
    const widthChange = 800 / position.width;
    const heightChange = 480 / position.height;
    return { widthChange, heightChange };
};

export default function Statement() {
    const [data, setData] = React.useState("");
    useEffect(() => {
        window.api.getScreencast((data) => {
            setData(data);
        });
    }, []);

    const handleClick = (event) => {
        const position = event.currentTarget.getBoundingClientRect();
        const { widthChange, heightChange } = getRatio(position);
        window.api.screencastInteract(
            JSON.stringify({
                type: "click",
                x: widthChange * (event.clientX - position.left),
                y: heightChange * (event.clientY - position.top),
            })
        );
    };

    const handleMouseMove = (event) => {
        const position = event.currentTarget.getBoundingClientRect();
        const { widthChange, heightChange } = getRatio(position);

        window.api.screencastInteract(
            JSON.stringify({
                type: "move",
                x: widthChange * (event.clientX - position.left),
                y: heightChange * (event.clientY - position.top),
            })
        );
    };

    const handleWheel = (event) => {
        window.api.screencastInteract(
            JSON.stringify({
                type: "scroll",
                y: event.deltaY,
                x: event.deltaX,
            })
        );
    };

    return data ? (
        <img
            onClick={handleClick}
            src={`data:image/jpeg;base64, ${data}`}
            alt="Red dot"
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            style={{ width: "100%", height: "99%" }}
        />
    ) : (
        <>Screencast not working</>
    );
}
