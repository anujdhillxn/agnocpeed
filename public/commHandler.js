const getCommHandler = () => {
    let win;

    const initialize = (_win) => {
        win = _win;
    };

    const setLoginMessage = (text) => {
        win.webContents.send("getLoginMessage", text);
    };

    const sendNotif = (type, message) => {
        win.webContents.send("notif", { message: message, danger: type });
    };

    const updateUIState = (state) => {
        win.webContents.send("getState", state);
    };

    const screencast = (img) => {
        win.webContents.send("getScreencast", img);
    };

    return {
        initialize,
        setLoginMessage,
        sendNotif,
        updateUIState,
        screencast,
    };
};

module.exports = {
    getCommHandler,
};
