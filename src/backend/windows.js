const path = require('path');
const { BrowserWindow, Menu } = require('electron');
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib');
const data = require('@backend/data');

Menu.setApplicationMenu(null);

const windows = {
    main: null,
    editor: null,
    flashcards: null,
};

const createWindow = (which, options) => {
    // - Define width, height and parent:
    let width, height, parent;
    if (which === 'main' || which === 'flashcards') {
        width = 1200;
        height = 800;
    }
    if (which === 'add-card' || which === 'edit-card') {
        width = 1000;
        height = 650;
    }
    if (which === 'add-card' || which === 'flashcards') parent = windows.main;
    if (which === 'edit-card') parent = windows[options.parent];
    // - Create and configure the window:
    const win = new BrowserWindow({
        width,
        height,
        parent,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            preload: path.resolve(__dirname, 'preload.js'),
        },
    });
    const windowData = data.getWindowData(which, options);
    win.once('ready-to-show', () => {
        win.webContents.send('set-data', JSON.stringify(windowData));
        win.show();
    });
    // - Set callbacks on window events:
    win.once('closed', () => {
        if (which === 'add-card' || which === 'edit-card') {
            parent.webContents.send('hide-backdrop');
            windows.editor = null;
        } else if (which === 'flashcards') {
            windows.main.webContents.send('hide-backdrop');
            windows.flashcards = null;
        }
    });
    // - Navigate:
    const server = process.env.WEBPACK_DEV_SERVER_URL;
    if (server) win.webContents.openDevTools();
    else createProtocol('app');
    if (which === 'main') {
        windows.main = win;
        if (windowData.profileName) {
            if (server) win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/dash.html');
            else win.loadURL('app://./dash.html');
        } else {
            if (server) win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/profiles.html');
            else win.loadURL('app://./profiles.html');
        }
    } else if (which === 'add-card' || which === 'edit-card') {
        windows.editor = win;
        if (server) win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/editor.html');
        else win.loadURL('app://./editor.html');
    } else if (which === 'flashcards') {
        windows.flashcards = win;
        if (server) win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/flashcards.html');
        else win.loadURL('app://./flashcards.html');
    }
};

const closeWindow = (which) => {
    if (windows[which]) windows[which].close();
};

const addToCardsView = (card) => {
    windows.main.webContents.send('add-to-cards-view', JSON.stringify(card));
};

const cardUpdated = (card, satisfyFilters) => {
    windows.main.webContents.send('card-updated', JSON.stringify({ card, satisfyFilters }));
    if (windows.flashcards) {
        windows.flashcards.webContents.send('card-updated', JSON.stringify({ card, satisfyFilters }));
    }
};

const setFormattedTags = (tags) => {
    windows.main.webContents.send('set-formatted-tags', JSON.stringify(tags));
};

const alertDeletedMedia = () => {
    windows.main.webContents.send('alert-deleted-media');
};

module.exports = {
    createWindow,
    closeWindow,
    addToCardsView,
    cardUpdated,
    setFormattedTags,
    alertDeletedMedia,
};
