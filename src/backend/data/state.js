const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const axios = require('axios');
const { Autolinker } = require('autolinker');
const { proxies, fileProxy } = require('./fileproxy');
const { loadCards, cardSatisfyFilters } = require('./db');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);
const autolinker = new Autolinker({
    email: false,
    phone: false,
    stripPrefix: false,
    newWindow: false,
    truncate: { length: 45, location: 'middle' },
    replaceFn(match) {
        let url = match.getUrl();
        const text = match.getAnchorText();
        if (url.startsWith('http://')) url = url.replace('http://', 'https://');
        return `<a href="autolinker:${url}">${text}</a>`;
    },
});

const dataDir = './langbook-data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
fileProxy(`${dataDir}/profiles.json`, 'profiles', {
    currProfile: null,
    allProfiles: [],
});

// - Load a profile's data to the proxies:
const loadProfile = (code) => {
    const dir = `${dataDir}/${code}`;
    fileProxy(`${dir}/info.json`, 'info', {
        nextDirInt: 1,
        nextSessionInt: 1,
    });
    fileProxy(`${dir}/tree.json`, 'tree', [
        {
            id: 'trash',
            parent: '#',
            text: 'Trash',
            type: 'trash',
            createdAt: Date.now(),
            state: {
                opened: false,
                selected: false,
            },
        },
    ]);
    fileProxy(`${dir}/cardsview.json`, 'cardsView', []);
    fileProxy(`${dir}/tags.json`, 'tags', { deleted: 0, audio: 0 });
    fileProxy(`${dir}/sessions.json`, 'sessions', {});
    fileProxy(`${dir}/filters.json`, 'filters', {
        tags: [],
        text: '',
    });
    fileProxy(`${dir}/settings.json`, 'settings', {
        reviewProb: '20',
        suspendedProb: '10',
        hideMenuOnStartup: false,
    });
    proxies.profiles.allProfiles.find((p) => p.code === code).lastAccess = Date.now();
    loadCards(`${dir}/cards.json`);
};

// - Check if there is a profile currently selected:
if (proxies.profiles.currProfile) {
    const name = proxies.profiles.currProfile;
    const { code } = proxies.profiles.allProfiles.find((p) => p.name === name);
    loadProfile(code);
}

const getProfileByName = (name) => {
    return proxies.profiles.allProfiles.find((p) => p.name === name);
};
const getProfileByCode = (code) => {
    return proxies.profiles.allProfiles.find((p) => p.code === code);
};

const getCurrProfile = () => {
    return getProfileByName(proxies.profiles.currProfile);
};

const formatAllTags = () => {
    const res = [];
    for (const [name, count] of Object.entries(proxies.tags)) {
        res.push({
            text: `${name} (${count})`,
            value: name,
            count,
        });
    }
    return res.sort((a, b) => {
        if (a.count > b.count) return -1;
        if (a.count < b.count) return 1;
        return 0;
    });
};
const formatAllSessions = () => {
    const res = [];
    for (const [id, session] of Object.entries(proxies.sessions)) {
        res.push({
            text: `${session.name} (${session.count})`,
            value: id,
            createdAt: session.createdAt,
        });
    }
    return res;
};
const getMostRecentSession = () => {
    let res = null,
        ts = 0;
    for (const [id, session] of Object.entries(proxies.sessions)) {
        if (session.createdAt > ts) {
            ts = session.createdAt;
            res = id;
        }
    }
    return res;
};

const getWindowData = (window, options) => {
    const res = {};
    const currProfile = getCurrProfile();
    if (currProfile) res.theme = currProfile.theme;
    else res.theme = 'theme-dark';
    if (window === 'main') {
        if (currProfile) {
            res.profileName = currProfile.name;
            res.tree = proxies.tree;
            res.cardsProp = proxies.cardsView;
            res.tagsProp = formatAllTags();
            res.filters = proxies.filters;
            res.settingsProp = proxies.settings;
            res.nextSessionInt = proxies.info.nextSessionInt;
            res.nextDirInt = proxies.info.nextDirInt;
        } else {
            res.allProfilesProp = proxies.profiles.allProfiles;
        }
    } else if (window === 'add-card') {
        res._id = nanoid();
        res.action = 'add-card';
        res.front = '';
        res.back = '';
        res.extra = '';
        res.mediaProp = [];
        res.allowReversed = false;
        res.tags = [];
        res.sessions = [getMostRecentSession()];
        res.allTags = formatAllTags();
        res.allSessions = formatAllSessions();
    } else if (window === 'edit-card') {
        const card = proxies.cardsView.find((c) => c._id === options.cardId);
        res._id = card._id;
        res.action = 'edit-card';
        res.front = card.front;
        res.back = card.back;
        res.extra = card.extra;
        res.mediaProp = card.media;
        res.allowReversed = card.allowReversed;
        res.createdAt = card.createdAt;
        res.tags = card.tags;
        res.sessions = card.sessions;
        res.allTags = formatAllTags();
        res.allSessions = formatAllSessions();
    } else if (window === 'flashcards') {
        res.sessions = proxies.sessions;
        res.cardsProp = proxies.cardsView;
        res.reviewProbProp = proxies.settings.reviewProb;
        res.suspendedProbProp = proxies.settings.suspendedProb;
    }
    return res;
};

const createProfile = (name) => {
    if (getProfileByName(name)) throw new Error();
    const code = nanoid();
    fs.mkdirSync(`${dataDir}/${code}`);
    fs.mkdirSync(`${dataDir}/${code}/media`);
    proxies.profiles.currProfile = name;
    proxies.profiles.allProfiles.push({
        name,
        code,
        theme: 'theme-dark',
        numSessions: 0,
        numCards: 0,
        createdAt: Date.now(),
        lastAccess: Date.now(),
    });
    loadProfile(code);
    return JSON.stringify(getWindowData('main'));
};

const renameProfile = (name, code) => {
    if (getProfileByName(name)) throw new Error();
    getProfileByCode(code).name = name;
};

const selectProfile = (name) => {
    proxies.profiles.currProfile = name;
    loadProfile(getProfileByName(name).code);
    return JSON.stringify(getWindowData('main'));
};

const deleteProfile = (name) => {
    const profile = getProfileByName(name);
    const now = Date.now();
    profile.deleted = now;
    profile.name = `~DELETED_${now}_${profile.name}`;
};

const logout = () => {
    proxies.profiles.currProfile = null;
    return JSON.stringify(getWindowData('main'));
};

const createNode = (node) => {
    proxies.tree.push(node);
    if (node.type === 'dir') proxies.info.nextDirInt++;
    else {
        getCurrProfile().numSessions++;
        proxies.info.nextSessionInt++;
        proxies.sessions[node.id] = {
            name: node.text,
            count: 0,
            createdAt: node.createdAt,
        };
    }
};

const renameNode = (id, name, type) => {
    proxies.tree.find((n) => n.id === id).text = name;
    if (type === 'session') {
        proxies.sessions[id].name = name;
    }
};

const moveNode = (id, newParentId) => {
    proxies.tree.find((n) => n.id === id).parent = newParentId;
};

const toggleOpened = (id) => {
    const node = proxies.tree.find((n) => n.id === id);
    node.state.opened = !node.state.opened;
};

const updateSettings = (settings) => {
    Object.assign(proxies.settings, settings);
};

const genHash = (str, len) => {
    return crypto.createHash('sha256').update(str, 'binary').digest('hex').substring(0, len);
};

const updateCardMedia = async (card) => {
    const mediaDir = `${dataDir}/${getCurrProfile().code}/media`;
    // 1. Update media from the media input:
    const mediaDelete = [];
    for (let i = 0; i < card.media.length; i++) {
        const media = card.media[i];
        // if the file path already points to mediaDir, ignore.
        if (!path.relative(mediaDir, path.dirname(media.path.replace('safe-file://', '')))) continue;
        if (!fs.existsSync(media.path.replace('safe-file://', ''))) mediaDelete.push(media.name);
        else {
            const newPath = `${mediaDir}/${card.createdAt}_${media.name}`;
            fs.copyFileSync(media.path, newPath);
            media.path = `safe-file://${newPath}`;
        }
    }
    card.media = card.media.filter((m) => !mediaDelete.includes(m.name));
    // 2. Update images from the rich-text editors:
    const $front = cheerio.load(card.front, null, false),
        $back = cheerio.load(card.back, null, false),
        $extra = cheerio.load(card.extra, null, false);
    const images = [...$front('img'), ...$back('img'), ...$extra('img')];
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        let src = image.attribs.src;
        const isBase64 = src.startsWith('data:image');
        const isUrl = src.startsWith('http');
        if (!isBase64 && !isUrl) continue;
        const hash = genHash(src, 10);
        const fPath = `${mediaDir}/${card.createdAt}_${hash}`;
        image.attribs.src = `safe-file://${fPath}`;
        if (fs.existsSync(fPath)) continue;
        if (isUrl) {
            const downloaded = await axios.get(src, { responseType: 'arraybuffer' });
            src = Buffer.from(downloaded.data).toString('base64');
        } else {
            src = src.slice(src.indexOf(';base64,') + ';base64,'.length);
        }
        fs.writeFileSync(fPath, src, 'base64');
    }
    card.front = $front.html();
    card.back = $back.html();
    card.extra = $extra.html();
    // Returns a boolean informing if any media was deleted and could not be loaded into the media's folder.
    return Boolean(mediaDelete.length);
};

const updateCardLinks = (card) => {
    card.front = autolinker.link(card.front);
    card.back = autolinker.link(card.back);
    card.extra = autolinker.link(card.extra);
};

const addCard = (card) => {
    // Returns a boolean indicating if the card satisfy the current filters.
    getCurrProfile().numCards++;
    card.tags.forEach((tag) => {
        if (!proxies.tags[tag]) proxies.tags[tag] = 1;
        else proxies.tags[tag]++;
    });
    card.sessions.forEach((session) => {
        proxies.sessions[session].count++;
    });
    const tags = proxies.filters.tags;
    const text = proxies.filters.text;
    const sessions = proxies.tree.filter((n) => n.type === 'session' && n.state.selected).map((s) => s.id);
    if (cardSatisfyFilters({ card, text, tags, sessions })) {
        proxies.cardsView.push(card);
        return true;
    }
    return false;
};

const updateCard = (card) => {
    // Returns a boolean indicating if the card satisfy the current filters.
    const oldCard = proxies.cardsView.find((c) => c._id === card._id);
    // 1. Update tags information:
    oldCard.tags.forEach((tag) => {
        if (!card.tags.includes(tag)) {
            proxies.tags[tag]--;
            if (!['deleted', 'audio'].includes(tag) && proxies.tags[tag] === 0) {
                delete proxies.tags[tag];
            }
        }
    });
    card.tags.forEach((tag) => {
        if (!oldCard.tags.includes(tag)) {
            if (!proxies.tags[tag]) {
                proxies.tags[tag] = 1;
            } else {
                proxies.tags[tag]++;
            }
        }
    });
    // 2. Update sessions information:
    oldCard.sessions.forEach((session) => {
        if (!card.sessions.includes(session)) {
            proxies.sessions[session].count--;
        }
    });
    card.sessions.forEach((session) => {
        if (!oldCard.sessions.includes(session)) {
            proxies.sessions[session].count++;
        }
    });
    // 3. Update cards view:
    const tags = proxies.filters.tags;
    const text = proxies.filters.text;
    const sessions = proxies.tree.filter((n) => n.type === 'session' && n.state.selected).map((s) => s.id);
    const satisfyFilters = cardSatisfyFilters({ card, text, tags, sessions });
    let i = 0;
    for (; i < proxies.cardsView.length; i++) {
        if (proxies.cardsView[i]._id === card._id) break;
    }
    proxies.cardsView.splice(i, 1);
    if (satisfyFilters) {
        proxies.cardsView.push(card);
    }
    return satisfyFilters;
};

const updateFilters = (text, tags, nodes) => {
    proxies.filters.text = text;
    proxies.filters.tags = tags;
    const nodesSet = new Set(nodes);
    const selectedSessions = [];
    proxies.tree.forEach((node) => {
        node.state.selected = nodesSet.has(node.id);
        if (node.type === 'session' && node.state.selected) selectedSessions.push(node.id);
    });
    return selectedSessions;
};

const updateCardsView = (cards) => {
    proxies.cardsView.splice(0, proxies.cardsView.length, ...cards);
};

const moveNodeToTrash = (id, newName) => {
    const node = proxies.tree.find((n) => n.id === id);
    node.text = newName;
    node.parent = 'trash';
};

const changeTheme = (theme) => {
    getCurrProfile().theme = theme;
};

module.exports = {
    getWindowData,
    createProfile,
    renameProfile,
    selectProfile,
    deleteProfile,
    logout,
    createNode,
    renameNode,
    moveNode,
    toggleOpened,
    updateSettings,
    updateCardMedia,
    updateCardLinks,
    addCard,
    updateCard,
    formatAllTags,
    updateFilters,
    updateCardsView,
    moveNodeToTrash,
    changeTheme,
};
