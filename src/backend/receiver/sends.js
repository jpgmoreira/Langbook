const { ipcMain } = require('electron');
const windows = require('@backend/windows');
const data = require('@backend/data');

ipcMain.on('open-add-card', () => {
    windows.createWindow('add-card');
});

ipcMain.on('open-edit-card', (_, { cardId, parent }) => {
    windows.createWindow('edit-card', { cardId, parent });
});

ipcMain.on('open-flashcards', () => {
    windows.createWindow('flashcards');
});

ipcMain.on('create-node', (_, node) => {
    data.createNode(node);
});

ipcMain.on('rename-node', (_, { id, name, type }) => {
    data.renameNode(id, name, type);
});

ipcMain.on('move-node', (_, { id, newParentId }) => {
    data.moveNode(id, newParentId);
});

ipcMain.on('toggle-opened', (_, id) => {
    data.toggleOpened(id);
});

ipcMain.on('update-settings', (_, settings) => {
    data.updateSettings(JSON.parse(settings));
});

ipcMain.on('close-editor', () => {
    windows.closeWindow('editor');
});

ipcMain.on('add-card', async (_, card) => {
    card = JSON.parse(card);
    const { satisfyFilters, deletedMedia } = await data.addCard(card);
    if (satisfyFilters) windows.addToCardsView(card);
    if (deletedMedia) windows.alertDeletedMedia();
    windows.setFormattedTags(data.formatAllTags());
    windows.closeWindow('editor');
});

ipcMain.on('update-card', async (_, card) => {
    card = JSON.parse(card);
    const { satisfyFilters, deletedMedia } = await data.updateCard(card);
    if (deletedMedia) windows.alertDeletedMedia();
    windows.cardUpdated(card, satisfyFilters);
    windows.setFormattedTags(data.formatAllTags());
    windows.closeWindow('editor');
});

ipcMain.on('move-node-to-trash', (_, { id, newName }) => {
    data.moveNodeToTrash(id, newName);
});

ipcMain.on('change-theme', (_, theme) => {
    data.changeTheme(theme);
});
