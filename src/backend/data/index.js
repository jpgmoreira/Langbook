const state = require('@backend/data/state');
const db = require('@backend/data/db');

const addCard = async (card) => {
    const deletedMedia = await state.updateCardMedia(card);
    state.updateCardLinks(card);
    db.addCard(card);
    const satisfyFilters = state.addCard(card);
    return { satisfyFilters, deletedMedia };
};

const updateCard = async (card) => {
    const deletedMedia = await state.updateCardMedia(card);
    state.updateCardLinks(card);
    const satisfyFilters = await state.updateCard(card);
    db.updateCard(card);
    return { satisfyFilters, deletedMedia };
};

const filterCards = async (text, tags, nodes, difficulties) => {
    const selectedSessions = state.updateFilters(text, tags, nodes, difficulties);
    const cards = await db.filterCards(text, tags, difficulties, selectedSessions);
    state.updateCardsView(cards);
    return cards;
};

module.exports = {
    addCard,
    updateCard,
    filterCards,
    // - Forwarded to state:
    getWindowData: state.getWindowData,
    createProfile: state.createProfile,
    renameProfile: state.renameProfile,
    selectProfile: state.selectProfile,
    deleteProfile: state.deleteProfile,
    logout: state.logout,
    createNode: state.createNode,
    renameNode: state.renameNode,
    moveNode: state.moveNode,
    toggleOpened: state.toggleOpened,
    updateSettings: state.updateSettings,
    formatAllTags: state.formatAllTags,
    moveNodeToTrash: state.moveNodeToTrash,
    changeTheme: state.changeTheme,
};
