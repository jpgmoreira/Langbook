const { ipcMain } = require('electron');

const data = require('@backend/data');

ipcMain.handle('create-profile', (_, name) => {
    return data.createProfile(name);
});

ipcMain.handle('select-profile', (_, name) => {
    return data.selectProfile(name);
});

ipcMain.handle('rename-profile', (_, { name, code }) => {
    return data.renameProfile(name, code);
});

ipcMain.handle('delete-profile', (_, name) => {
    data.deleteProfile(name);
});

ipcMain.handle('logout', () => {
    return data.logout();
});

ipcMain.handle('filter-cards', (_, { text, tags, nodes, difficulties }) => {
    return data.filterCards(text, tags, nodes, difficulties);
});
