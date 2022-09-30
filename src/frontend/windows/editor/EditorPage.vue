<template>
    <div class="editor-page">
        <div>
            <RichTextEditor class="field" ref="front" :initial="front" placeholder="FRONT" />
            <RichTextEditor class="field" ref="back" :initial="back" placeholder="BACK" />
            <RichTextEditor class="field" ref="extra" :initial="extra" placeholder="EXTRA" />
            <MediaInput class="media" :items="media" @add="addMedia" @remove="removeMedia" placeholder="MEDIA" />
        </div>
        <hr class="my-1" />
        <div>
            <MultiSelect class="mb-1 tags-multiselect" ref="tags-multiselect" :options="tagsOptions" :items="tags" :create="createTagFilter" :onItemRemove="removeTagFilter" placeholder="Tags" />
            <MultiSelect ref="sessions-multiselect" :options="allSessions" :items="sessions" placeholder="Sessions" />
            <div class="d-flex align-items-center justify-content-around my-1">
                <div>
                    <input type="checkbox" id="toggle-allow-reversed" ref="toggle-allow-reversed" class="form-check-input mx-2" :checked="allowReversed" />
                    <label class="user-select-none" for="toggle-allow-reversed">Allow reversed</label>
                </div>
                <button v-if="action === 'add-card'" class="btn btn-primary" @click="addCard" :disabled="blockButtons">Add</button>
                <button v-if="action === 'edit-card'" class="btn btn-primary" @click="updateCard" :disabled="blockButtons">Save</button>
                <button class="btn btn-warning text-dark" @click="cancel">Cancel</button>
            </div>
        </div>
        <toast :visible="toast.visible"> {{ toast.message }} </toast>
    </div>
</template>

<script>
    import Toast from '@frontend/components/Toast.vue';
    import MediaInput from '@frontend/components/MediaInput.vue';
    import RichTextEditor from '@frontend/components/rte/RichTextEditor.vue';
    import MultiSelect from '@frontend/components/selectize/MultiSelect.vue';
    export default {
        components: {
            Toast,
            MediaInput,
            RichTextEditor,
            MultiSelect,
        },
        props: {
            _id: String,
            action: String,
            front: String,
            back: String,
            extra: String,
            mediaProp: Array,
            allowReversed: Boolean,
            tags: Array,
            sessions: Array,
            createdAt: {
                type: Number,
                default: 0,
            },
            allTags: Array,
            allSessions: Array,
        },
        data() {
            return {
                blockButtons: false, // Avoid multiple clicks on buttons.
                media: this.mediaProp,
                toast: {
                    visible: false,
                    message: '',
                    timer: null,
                },
                lastScroll: 0,
                specialTagCodes: {
                    // Codes used to identify special tags that cannot be added manually.
                    audio: 'oFihOXOI3dGeWxCG',
                },
                audioTagAutoRemove: false,
            };
        },
        computed: {
            tagsOptions() {
                // Since the 'audio' tag cannot be manually added to a card, we don't show it in the options.
                return this.allTags.filter((t) => t.value !== 'audio');
            },
        },
        mounted() {
            if (this.action === 'add-card') {
                document.title = 'Create a new card';
                this.$refs['front'].focus();
            } else if (this.action === 'edit-card') {
                document.title = 'Edit card';
            }
            if (this.tags.includes('audio')) {
                this.$refs['tags-multiselect'].insertItemByCode(this.specialTagCodes.audio);
            }
            // Set to update the sticky class of the scrollbars (for correct positioning of their toolboxes) when scrolling the window:
            this.updateToolbarsSticky();
            window.onscroll = this.updateToolbarsSticky;
        },
        methods: {
            showToast(message) {
                this.toast.message = message;
                this.toast.visible = true;
                clearTimeout(this.toast.timer);
                this.toast.timer = setTimeout(() => {
                    this.toast.visible = false;
                }, 3000);
            },
            addMedia(files) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (!file.type.includes('audio') && !file.type.includes('image')) {
                        this.showToast('Only images and audio can be added as media!');
                        continue;
                    }
                    if (this.media.some((f) => f.name.trim() === file.name.trim())) {
                        this.showToast('Cannot have two media files with the same name!');
                        continue;
                    }
                    if (file.type.includes('audio')) {
                        this.$refs['tags-multiselect'].insertItemByCode(this.specialTagCodes.audio);
                    }
                    this.media.push(file);
                }
            },
            removeMedia(file) {
                this.media = this.media.filter((f) => f.name.trim() !== file.name.trim());
                if (!this.media.some((f) => f.type.includes('audio'))) {
                    this.audioTagAutoRemove = true;
                    this.$refs['tags-multiselect'].removeOption('audio');
                }
            },
            validateCard(card) {
                if (!card.sessions.length) {
                    this.showToast('A card must have at least one session!');
                    return false;
                }
                if (!card.front) {
                    this.showToast('All cards must have a front field!');
                    return false;
                }
                return true;
            },
            addCard() {
                const card = {
                    _id: this._id,
                    front: this.trimCardField(this.$refs['front'].getValue()),
                    back: this.trimCardField(this.$refs['back'].getValue()),
                    extra: this.trimCardField(this.$refs['extra'].getValue()),
                    allowReversed: this.$refs['toggle-allow-reversed'].checked,
                    createdAt: Date.now(),
                    sessions: this.$refs['sessions-multiselect'].getValue(),
                    tags: this.$refs['tags-multiselect'].getValue(),
                    media: this.media,
                };
                if (this.validateCard(card)) {
                    this.blockButtons = true;
                    window.api.send('add-card', JSON.stringify(card));
                }
            },
            updateCard() {
                const card = {
                    _id: this._id,
                    front: this.trimCardField(this.$refs['front'].getValue()),
                    back: this.trimCardField(this.$refs['back'].getValue()),
                    extra: this.trimCardField(this.$refs['extra'].getValue()),
                    allowReversed: this.$refs['toggle-allow-reversed'].checked,
                    createdAt: this.createdAt,
                    sessions: this.$refs['sessions-multiselect'].getValue(),
                    tags: this.$refs['tags-multiselect'].getValue(),
                    media: this.media,
                };
                if (this.validateCard(card)) {
                    this.blockButtons = true;
                    window.api.send('update-card', JSON.stringify(card));
                }
            },
            cancel() {
                window.api.send('close-editor');
            },
            updateToolbarsSticky() {
                if (Date.now() - this.lastScroll < 100) return;
                this.lastScroll = Date.now();
                document.querySelectorAll('.toolbar').forEach((toolbar) => {
                    const bottom = window.innerHeight - toolbar.getBoundingClientRect().bottom;
                    if (bottom < 5) toolbar.classList.add('sticky');
                    else toolbar.classList.remove('sticky');
                });
            },
            createTagFilter(text) {
                if (text.toLowerCase().trim() === 'audio') {
                    this.showToast('The "audio" tag cannot be manually added to a card!');
                    return false;
                }
                if (text === this.specialTagCodes.audio) text = 'audio'; // Received the code to add the 'audio' tag, when the user adds an audio file.
                return {
                    value: text,
                    text,
                };
            },
            removeTagFilter(value) {
                if (value === 'audio') {
                    if (!this.audioTagAutoRemove) {
                        // The 'audio' tag cannot be manually removed by the user.
                        this.$refs['tags-multiselect'].insertItemByCode(this.specialTagCodes.audio);
                        this.showToast('The "audio" tag cannot be manually removed!');
                    }
                    this.audioTagAutoRemove = false;
                }
            },
            trimCardField(content) {
                // prettier-ignore
                return content
                    .replace(/^(\s*&nbsp;\s*)*/, '')
                    .replace(/^(\s*<div>\s*((\s*<br>\s*)|(\s*&nbsp;\s*))*\s*<\/div>\s*)*/, '')
                    .replace(/(\s*<div>\s*((\s*<br>\s*)|(\s*&nbsp;\s*))*\s*<\/div>\s*)*$/, '')
                    .trim();
            },
        },
    };
</script>

<style scoped>
    .editor-page {
        padding: 6px;
        padding-bottom: 0;
    }
    .field {
        min-height: 133px;
        margin-bottom: 4px;
    }
    .media {
        height: 95px;
    }
</style>
<style>
    .editor-page .tags-multiselect .item[data-value='audio'] {
        padding: 2px 5px !important;
    }
    .editor-page .tags-multiselect .item[data-value='audio'] a {
        display: none;
    }
</style>
