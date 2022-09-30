<template>
    <div v-if="visible" class="context-menu position-absolute" :style="menuPosition">
        <div v-if="menu === 'sessions-column'">
            <div @click="createSession('#')">New session</div>
            <div @click="createDir('#')">New directory</div>
        </div>
        <div v-else-if="menu === 'session'">
            <div @click="editNodeName(nodeId)">Rename</div>
            <div @click="moveNodeToTrash(nodeId)">Move to trash</div>
        </div>
        <div v-else-if="menu === 'dir'">
            <div @click="createSession(nodeId)">New session</div>
            <div @click="createDir(nodeId)">New directory</div>
            <div @click="editNodeName(nodeId)">Rename</div>
            <div @click="moveNodeToTrash(nodeId)">Move to trash</div>
        </div>
        <div v-else-if="menu === 'card'">
            <div @click="$emit('card-edit', cardId)">Edit</div>
            <div @click="$emit('card-delete', cardId)">Delete</div>
        </div>
    </div>
</template>

<script>
    import treeManager from './tree/treeManager';
    export default {
        emits: ['card-edit', 'card-delete'],
        props: {
            event: {
                required: true,
            },
        },
        data() {
            return {
                visible: false,
                cardId: null,
                nodeId: null,
                menuPosition: {},
                menu: null, // 'sessions-column', 'session', 'dir', 'card'.
            };
        },
        methods: {
            createSession(parentId) {
                treeManager.createSession(parentId);
            },
            createDir(parentId) {
                treeManager.createDir(parentId);
            },
            editNodeName(nodeId) {
                treeManager.editNodeName(nodeId);
            },
            moveNodeToTrash(nodeId) {
                treeManager.moveNodeToTrash(nodeId);
            },
        },
        watch: {
            event(e) {
                this.menuPosition = {};
                this.menu = null;
                this.visible = false;
                if (!e) return;
                // Test which menu to show:
                const sessionsColumn = e.target.classList.contains('jstree-parent') || e.target.classList.contains('jstree-node') || e.target.classList.contains('right-click-here');
                const session = e.target.classList.contains('session-icon') || e.target.getAttribute('type') === 'session';
                const dir = e.target.classList.contains('dir-icon') || e.target.getAttribute('type') === 'dir';
                const card = e.target.closest('.my-card');
                if (sessionsColumn) this.menu = 'sessions-column';
                else if (session) this.menu = 'session';
                else if (dir) this.menu = 'dir';
                else if (card) {
                    this.cardId = card.dataset.cardId;
                    this.menu = 'card';
                } else return;
                if (session || dir) {
                    let element = e.target;
                    while (!element.classList.contains('jstree-anchor')) element = element.parentNode;
                    this.nodeId = element.id.replace('_anchor', '');
                }
                // Adjust position:
                let xOffset = 130,
                    yOffset = 110;
                if (this.menu === 'dir') yOffset = 145;
                const mx = e.clientX,
                    my = e.clientY,
                    vw = document.documentElement.clientWidth,
                    vh = document.documentElement.clientHeight;
                if (vw - mx > xOffset) this.menuPosition.left = e.pageX + 'px';
                else this.menuPosition.right = window.innerWidth - e.pageX + 'px';
                if (vh - my > yOffset) this.menuPosition.top = e.pageY + 'px';
                else this.menuPosition.bottom = window.innerHeight - e.pageY + 'px';
                // Show:
                this.visible = true;
            },
        },
    };
</script>

<style scoped>
    .context-menu > div > div {
        padding: 4px 8px;
        cursor: pointer;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
    }
</style>
