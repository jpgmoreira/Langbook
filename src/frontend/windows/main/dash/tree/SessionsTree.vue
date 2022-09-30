<template>
    <div class="jstree-parent" @dblclick="toggleSelectAll">
        <div id="jstree"></div>
    </div>
</template>

<script>
    import $ from 'jquery';
    import './jstree/jstree.min';
    import treeManager from './treeManager';
    export default {
        props: {
            tree: Array,
        },
        mounted() {
            $('#jstree').jstree(this.options);
            treeManager.setInstance($('#jstree').jstree(true));
        },
        methods: {
            toggleSelectAll() {
                treeManager.toggleSelectAll();
            },
        },
        data() {
            return {
                options: {
                    // The contextmenu plugin is used here only to keep focus on a node when we open a context menu.
                    plugins: ['checkbox', 'dnd', 'sort', 'types', 'contextmenu'],
                    contextmenu: {
                        select_node: false,
                    },
                    dnd: {
                        copy: false,
                    },
                    types: {
                        dir: {
                            icon: 'dir-icon',
                            a_attr: {
                                type: 'dir',
                            },
                        },
                        trash: {
                            icon: 'trash-icon',
                            a_attr: {
                                type: 'trash',
                            },
                        },
                        session: {
                            icon: 'session-icon',
                            max_children: 0,
                            a_attr: {
                                type: 'session',
                            },
                        },
                    },
                    core: {
                        worker: false,
                        restore_focus: false,
                        data: this.tree,
                        check_callback() {
                            return true;
                        },
                    },
                    sort(a, b) {
                        // 'a' and 'b' are node ids, not objects. 'original' below is necessary.
                        a = this.get_node(a).original;
                        b = this.get_node(b).original;
                        if (a.type === b.type) {
                            return a.createdAt > b.createdAt ? 1 : -1;
                        }
                        if (a.type === 'trash') return -1;
                        if (b.type === 'trash') return 1;
                        return a.type === 'session' ? 1 : -1;
                    },
                },
            };
        },
    };
</script>

<style>
    .vakata-context {
        display: none !important;
    }
</style>

<style scoped>
    .jstree-parent {
        padding-top: 3px;
        overflow-y: scroll;
        height: 100vh;
        padding-bottom: 100px;
    }
</style>
