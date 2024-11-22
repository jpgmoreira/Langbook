const { stripHtml } = require('string-strip-html');
const Datastore = require('nedb-promises');

let cards = null;

const loadCards = (cardsPath) => {
    cards = Datastore.create({
        filename: cardsPath,
        autoload: true,
    });
};

const addCard = (card) => {
    cards.insert(card);
};

const updateCard = (card) => {
    cards.update({ _id: card._id }, card);
};

const cardSatisfyFilters = ({ card, text, tags, difficulties, sessions }) => {
    // tags: selected tag names.
    // sessions: selected session ids.
    // difficulties: array of ints with the selected difficulties.
    // 1. The card must be in at least one selected session:
    if (!sessions.some((s) => card.sessions.includes(s))) return false;
    // 2. The card must have all selected tags:
    //    (In case the card has the 'deleted' tag: It will only match if the
    //       deleted tag was explicitly chosen as a filter).
    if (!tags.every((t) => card.tags.includes(t))) return false;
    if (card.tags.includes('deleted') && !tags.includes('deleted')) return false;
    // 3. The card's difficulty must be contained in the difficulties array:
    if (difficulties.length && !difficulties.includes(card.difficulty)) return false;
    // 4. At least one card's field must match the search text:
    const searchText = text.trim().replace(/\s+/g, '').toLowerCase();
    if (searchText) {
        const cardFront = stripHtml(card.front).result.replace(/\s+/g, '').toLowerCase();
        const cardBack = stripHtml(card.back).result.replace(/\s+/g, '').toLowerCase();
        const cardExtra = stripHtml(card.extra).result.replace(/\s+/g, '').toLowerCase();
        const regexp = new RegExp(searchText, 'i');
        let textMatch = false;
        textMatch = textMatch || regexp.test(cardFront);
        textMatch = textMatch || regexp.test(cardBack);
        textMatch = textMatch || regexp.test(cardExtra);
        if (!textMatch) return false;
    }
    return true;
};

const filterCards = async (text, tags, difficulties, sessions) => {
    if (!sessions.length) return [];
    const allCards = await cards.find({});
    return allCards.filter((card) => cardSatisfyFilters({ card, text, tags, difficulties, sessions }));
};

const getCardById = async (_id) => {
    return await cards.findOne({ _id });
};

module.exports = {
    loadCards,
    addCard,
    updateCard,
    cardSatisfyFilters,
    filterCards,
    getCardById,
};
