const URL = require('url').URL;
const path = require('path');
const open = require('open');
const { app, protocol, BrowserWindow } = require('electron');
const { default: installExtension, VUEJS3_DEVTOOLS } = require('electron-devtools-installer');
const windows = require('@backend/windows');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

// Enable sandbox globally for all renderers.
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await installExtension(VUEJS3_DEVTOOLS);
    }
    // Create a custom protocol for loading local files:
    // [https://stackoverflow.com/a/61623585/7974053]
    protocol.registerFileProtocol('safe-file', (request, callback) => {
        const url = request.url.replace('safe-file://', '');
        try {
            return callback(decodeURIComponent(path.resolve(url)));
        } catch (error) {
            console.log(error);
        }
    });
    windows.createWindow('main');
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) windows.createWindow('main');
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Additional security features.
app.on('web-contents-created', (_, contents) => {
    // Disable navigation.
    contents.on('will-navigate', (event, url) => {
        const { href } = new URL(url);
        if (href.startsWith('autolinker:')) {
            open(href.replace('autolinker:', ''));
        }
        const allowed = ['http://localhost:8080//dash.html', 'app://./dash.html', 'http://localhost:8080//profiles.html', 'app://./profiles.html'];
        if (!allowed.includes(href)) {
            event.preventDefault();
        }
    });
    // Avoid opening new windows.
    contents.setWindowOpenHandler(() => {
        return { action: 'deny ' };
    });
});
