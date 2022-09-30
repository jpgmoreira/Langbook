const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);

let jstree = null; // jstree instance.

let tree = null; // tree from the backend.
let showToast = null; // will be set to a function that shows a toast.
let nodeSelection = null; // will be set to a function that handles node selection events.
let incNumSessions = null; // will be set to a function that updates the number of sessions.
let nextSessionInt, nextDirInt;

const init = (args) => {
    tree = args.tree;
    nextSessionInt = args.nextSessionInt;
    nextDirInt = args.nextDirInt;
    showToast = args.showToast;
    nodeSelection = args.nodeSelection;
    incNumSessions = args.incNumSessions;
};

const setInstance = (instance) => {
    jstree = instance;
    const el = jstree.element;
    // - Open the directory when creating a sub-node:
    el.on('create_node.jstree', (_, { node, parent }) => {
        if (node.type === 'session') {
            incNumSessions();
            jstree.select_node(node);
        }
        if (parent !== '#') jstree.open_node(parent);
        jstree.hover_node(node.id);
    });
    // - Moving nodes:
    el.on('move_node.jstree', (_, { node, parent, old_parent }) => {
        if (tree.some((n) => n.parent === parent && n.text.trim() === node.text.trim() && n.id !== node.id)) {
            showToast('Two sibling sessions or directories cannot have the same name!');
            jstree.move_node(node.id, old_parent);
            return;
        }
        tree.find((n) => n.id === node.id).parent = parent;
        window.api.send('move-node', { id: node.id, newParentId: parent });
    });
    // - Opening and closing directories (no need to update the local tree on this):
    el.on('open_node.jstree close_node.jstree', (_, { node }) => {
        window.api.send('toggle-opened', node.id);
    });
    // - Selecting or deselecting nodes (filters are lazy-updated in the back-end. No need to update the local tree on this):
    let selectTimer = null;
    el.on('select_node.jstree deselect_node.jstree select_all.jstree deselect_all.jstree', () => {
        clearTimeout(selectTimer);
        selectTimer = setTimeout(() => {
            nodeSelection(jstree.get_bottom_selected(true).filter((n) => n.type === 'session').length);
        }, 10);
    });
};

const createSession = (parentId) => {
    while (tree.some((n) => n.parent === parentId && n.text.trim() === `Session${nextSessionInt}`)) nextSessionInt++;
    const node = {
        id: nanoid(),
        parent: parentId,
        text: `Session${nextSessionInt}`,
        type: 'session',
        createdAt: Date.now(),
        state: {
            selected: false,
        },
    };
    nextSessionInt++;
    tree.push(node);
    jstree.create_node(parentId, node);
    window.api.send('create-node', node);
};

const createDir = (parentId) => {
    while (tree.some((n) => n.parent === parentId && n.text.trim() === `Dir${nextDirInt}`)) nextDirInt++;
    const node = {
        id: nanoid(),
        parent: parentId,
        text: `Dir${nextDirInt}`,
        type: 'dir',
        createdAt: Date.now(),
        state: {
            opened: false,
            selected: false,
        },
    };
    nextDirInt++;
    tree.push(node);
    jstree.create_node(parentId, node);
    window.api.send('create-node', node);
};

const editNodeName = (nodeId) => {
    const prevName = jstree.get_node(nodeId).text.trim();
    jstree.edit(nodeId, null, (node, status, cancelled) => {
        const newName = node.text.trim();
        if (!status || cancelled || prevName === newName) return;
        if (!newName) {
            jstree.rename_node(nodeId, prevName);
            showToast('Session and directory names cannot be empty!');
            return;
        }
        if (tree.some((n) => n.parent === node.parent && n.text.trim() === newName)) {
            jstree.rename_node(nodeId, prevName);
            showToast('Two sibling sessions or directories cannot have the same name!');
            return;
        }
        tree.find((n) => n.id === nodeId).text = newName;
        const args = { id: nodeId, name: newName, type: node.type };
        window.api.send('rename-node', args);
    });
};

const moveNodeToTrash = (nodeId) => {
    const node = tree.find((n) => n.id === nodeId);
    const newName = Date.now() + '_' + node.text;
    node.text = newName;
    jstree.rename_node(nodeId, newName);
    jstree.move_node(nodeId, 'trash');
    window.api.send('move-node-to-trash', { id: nodeId, newName });
};

const toggleSelectAll = () => {
    if (jstree.get_selected().length !== tree.length) jstree.select_all();
    else jstree.deselect_all();
};

const getSelected = () => {
    return jstree.get_selected();
};

module.exports = {
    init,
    setInstance,
    createSession,
    createDir,
    editNodeName,
    moveNodeToTrash,
    toggleSelectAll,
    getSelected,
};
