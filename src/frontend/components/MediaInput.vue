<template>
    <div class="media-parent">
        <div>
            <div v-if="!items.length" class="media-placeholder d-flex flex-column align-items-center">
                <div>{{ placeholder }}</div>
                <div class="click-or-drop-files-here text-nowrap">(Click or drop files here)</div>
            </div>
            <input type="file" class="media-input" accept="image/*,audio/*" @change="addFiles" title="" multiple />
            <div class="d-flex flex-wrap">
                <span class="media-item d-flex align-items-center text-nowrap" v-for="item in items" :key="item.name">
                    <tippy :hideOnClick="false">
                        <template #content>Double-click to remove</template>
                        <div class="media-remove" @dblclick="$emit('remove', item)"></div>
                    </tippy>
                    <span class="media-name">{{ item.name }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     * "items" array must contain objects in the form:
     * {
     *      name: String,
     *      path: String,
     *      type: String, ('image' | 'audio')
     * }
     */
    export default {
        emits: ['add', 'remove'],
        props: {
            items: {
                type: Array,
                default() {
                    return [];
                },
            },
            placeholder: String,
        },
        methods: {
            addFiles(event) {
                const files = [...event.target.files].map((file) => {
                    return {
                        name: file.name,
                        type: file.type,
                        path: file.path,
                    };
                });
                event.target.value = null; // Necessary. Comment this line and try to add a file, remove it, then add it again to see why.
                this.$emit('add', files);
            },
        },
    };
</script>

<style scoped>
    .click-or-drop-files-here {
        font-size: 1rem;
    }
    .media-parent {
        overflow-y: auto;
        overflow-x: hidden;
    }
    .media-parent > div {
        position: relative;
        min-height: 100%;
    }
    .media-item {
        margin: 1px;
        padding: 0 2px;
    }
    .media-input {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        opacity: 0;
    }
    .media-remove {
        width: 18px;
        height: 18px;
        cursor: pointer;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
    /* z-index: */
    .media-name {
        z-index: 0;
    }
    .media-input {
        z-index: 1;
    }
    .media-remove {
        z-index: 2;
        position: relative;
    }
</style>
