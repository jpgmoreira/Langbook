<!-- prettier-ignore -->
<template>
    <div class="dash-page d-flex"
        :class="{ resizing }"
        @mousemove="mouseMove"
        @mouseup="resizing = false"
        @mouseleave="resizing = false"
        @contextmenu="contextMenuEvent = $event"
        @wheel="contextMenuEvent = null"
        @click="contextMenuEvent = null"
        @mousedown="mouseDown"
        @dragstart.prevent
        @keyup.enter="filterCards"
    >
        <div class="sessions-column" ref="sessions-column" @dragstart.prevent>
            <SessionsTree :tree="tree" />
            <div class="resize" @mousedown="resizing = true" :class="{ resizing }" @dragstart.prevent></div>
            <div v-if="tree.length > 1" class="n-sessions-selected user-select-none">
                {{numSessionsSelected}} {{numSessionsSelected === 1 ? 'session' : 'sessions'}} selected
            </div>
            <div v-else class="right-click-here gray-info-message position-absolute absolute-centering user-select-none">Right-click here</div>
        </div>
        <div class="cards-column d-flex flex-column flex-fill" ref="cards-column" @dragstart.prevent>
            <CardsView ref="cards-view" v-if="cards.length" :cards="cards" @card-edit="openEditCard"/>
            <div v-else class="gray-info-message d-flex flex-fill align-items-center justify-content-center user-select-none">No card satisfy the filters</div>
            <div class="dash-footer mt-auto">
                <div class="control-menu px-1 py-1 pb-2" :style="controlMenuStyle" :class="{ visible: menuVisible }">
                    <div class="fs-5">Filters:</div>
                    <MultiSelect class="tags-multisel" :options="tags" :items="filters.tags" placeholder="Tags" ref="filters-tags" @change="modifiedFilters = true" />
                    <input type="text" spellcheck="false" class="form-control mt-1" placeholder="Text" ref="filters-text" @input="modifiedFilters = true">
                    <!-- This element below could be refactored into a separate component. -->
                    <div class="d-flex my-1">
                        <div class="d-flex align-items-center me-1">Difficulty:</div>
                        <div class="d-flex">
                            <div
                                class="difficulty-filter-btn d-flex align-items-center justify-content-center"
                                :class="{ selected: filters.difficulties.includes(n) }"
                                @click="toggleFilterDifficulty(n); modifiedFilters = true"
                                v-for="n in 10"
                                :key="n"
                            >
                                {{ n }}
                            </div>
                        </div>
                    </div>
                    <hr class="m-0" />
                    <div class="fs-5">Settings:</div>
                    <ul class="mb-0">
                        <li class="mb-1">
                            <div class="d-flex align-items-center">
                                Review probability
                                <tippy :hideOnClick="false">
                                    <template #content>Probability of choosing a <i>review</i> card in the flashcards study. Defaults to 20%.</template>
                                    <div class="tooltip-icon ms-1"></div>
                                </tippy>
                                :
                                <input type="text" class="form-control percent-input ms-2 text-end" v-model.trim="settings.reviewProb"> %
                            </div>
                        </li>
                        <li class="mb-1">
                            <div class="d-flex align-items-center">
                                Suspended probability
                                <tippy :hideOnClick="false">
                                    <template #content>Probability of displaying (not skipping) a <i>suspended</i> card in the flashcards study. Defaults to 10%.</template>
                                    <div class="tooltip-icon ms-1"></div>
                                </tippy>
                                :                                
                                <input type="text" class="form-control percent-input ms-2 text-end" v-model.trim="settings.suspendedProb"> %
                            </div>
                        </li>
                        <li class="mb-1">
                            <div class="d-flex">
                                <div class="d-flex align-items-center">
                                Hide menu on startup
                                <tippy :hideOnClick="false">
                                    <template #content>Hide this menu on application startup.</template>
                                    <div class="tooltip-icon ms-1"></div>
                                </tippy>
                                </div>:
                                <input type="checkbox" class="form-check-input mx-2" v-model="settings.hideMenuOnStartup">
                            </div>
                        </li>
                        <li>
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    Theme:
                                    <select class="form-select form-select-sm ms-1" v-model="currTheme" @change="changeTheme($event.target.value)">
                                        <option value="theme-dark">Dark</option>
                                        <option value="theme-light">Light</option>
                                    </select>                                    
                                </div>
                                <a href="#" class="d-flex align-items-center text-danger text-decoration-none" @click.prevent="logout">
                                    Logout <div class="logout-icon ms-1"></div>
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="dash-buttons d-flex justify-content-evenly p-1">
                    <div class="position-relative mx-1">
                        <div class="menu-caret cursor-pointer" :class="{ rotate: menuVisible }" @click="menuVisible = !menuVisible"></div>
                    </div>
                    <button type="button" class="btn d-flex align-items-center" :class="modifiedFilters ? 'btn-warning text-dark' : 'btn-primary'" :disabled="backdropVisible" @click="filterCards">
                        Filter
                        <span v-if="filtering" class="ms-1 lds-dual-ring" :class="{'text-dark': modifiedFilters}"></span>
                    </button>
                    <div class="position-relative">
                        <tippy :hideOnClick="false" v-if="!numSessions" class="position-absolute top-0 bottom-0 w-100"><template #content>You must create a session first.</template></tippy>
                        <button type="button" class="btn btn-primary" :disabled="!numSessions || backdropVisible" @click="openAddCard">Add card</button>
                    </div>
                    <div class="position-relative">
                        <tippy :hideOnClick="false" v-if="!cards.length" class="position-absolute top-0 bottom-0 w-100"><template #content>Cannot use flashcards without filtered cards.</template></tippy>
                        <button type="button" class="btn btn-primary" :disabled="!cards.length || backdropVisible" @click="openFlashcards">Flashcards</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="backdrop" :class="{ 'backdrop-hidden': !backdropVisible }"></div>
        <ContextMenu :event="contextMenuEvent" @card-edit="openEditCard" @card-delete="deleteCard" />
        <toast :visible="toast.visible"> {{ toast.message }} </toast>
        <textarea class="clipboard" ref="clipboard"></textarea>
    </div>
</template>

<script>
    import Toast from '@frontend/components/Toast.vue';
    import MultiSelect from '@frontend/components/selectize/MultiSelect.vue';
    import SessionsTree from './tree/SessionsTree.vue';
    import ContextMenu from './ContextMenu.vue';
    import CardsView from './CardsView.vue';
    import treeManager from './tree/treeManager';
    export default {
        components: {
            SessionsTree,
            ContextMenu,
            CardsView,
            Toast,
            MultiSelect,
        },
        props: {
            theme: String,
            profileName: String,
            tree: Array,
            cardsProp: Array,
            tagsProp: Array,
            filtersProp: Object,
            settingsProp: Object,
            nextSessionInt: Number,
            nextDirInt: Number,
        },
        mounted() {
            document.title = `${this.profileName}@Langbook`;
            this.$refs['filters-text'].value = this.filters.text;
            if (this.cards.length) {
                this.$refs['cards-view'].scrollToBottom();
            }
            window.api.on('hide-backdrop', () => {
                this.backdropVisible = false;
            });
            window.api.on('add-to-cards-view', (card) => {
                this.cards.push(JSON.parse(card));
                setTimeout(() => {
                    this.$refs['cards-view'].scrollToBottom();
                }, 0);
            });
            window.api.on('card-updated', (data) => {
                const { card, satisfyFilters } = JSON.parse(data);
                this.cards = this.cards.filter((c) => c._id !== card._id);
                if (satisfyFilters) this.cards.push(card);
            });
            window.api.on('set-formatted-tags', (tags) => {
                const newTags = JSON.parse(tags);
                const oldTags = this.tags;
                const deletedTag = oldTags.some((to) => !newTags.some((tn) => tn.value === to.value));
                this.tags = newTags; // triggers a watcher in the multiselect.
                if (deletedTag) {
                    setTimeout(() => {
                        this.modifiedFilters = true;
                        this.filterCards();
                    }, 0);
                }
            });
            window.api.on('alert-deleted-media', () => {
                this.showToast('Some media files added to the card could not be found on disk.');
            });
            treeManager.init({
                tree: this.tree,
                nextSessionInt: this.nextSessionInt,
                nextDirInt: this.nextDirInt,
                showToast: this.showToast,
                nodeSelection: (numSessionsSelected) => {
                    this.numSessionsSelected = numSessionsSelected;
                    this.modifiedFilters = true;
                    this.$refs['clipboard'].focus();
                },
                incNumSessions: () => {
                    this.numSessions++;
                },
            });
        },
        data() {
            return {
                currTheme: this.theme,
                resizing: false,
                menuVisible: !this.settingsProp.hideMenuOnStartup,
                backdropVisible: false,
                contextMenuEvent: null,
                modifiedFilters: false,
                settings: this.settingsProp,
                cards: this.cardsProp,
                tags: this.tagsProp,
                filters: this.filtersProp,
                numSessions: this.tree.filter((n) => n.type === 'session').length,
                numSessionsSelected: this.tree.filter((n) => n.type === 'session' && n.state.selected).length,
                filtering: false,
                toast: {
                    visible: false,
                    message: '',
                    timer: null,
                },
            };
        },
        computed: {
            controlMenuStyle() {
                const res = {};
                if (this.menuVisible) {
                    res['height'] = '307px';
                } else {
                    res['height'] = '0px';
                    res['padding'] = '0px !important';
                    res['margin'] = '0px !important';
                    res['outline-width'] = '0px';
                }
                return res;
            },
        },
        methods: {
            mouseMove(event) {
                if (this.resizing) {
                    const offset = 15;
                    const sessionsColumnWidth = Math.min(Math.max(event.pageX, offset), window.innerWidth - offset);
                    const cardsColumnWidth = Math.max(window.innerWidth - sessionsColumnWidth - 8, offset);
                    this.$refs['sessions-column'].setAttribute('style', `width: ${sessionsColumnWidth}px`);
                    this.$refs['cards-column'].setAttribute('style', `width: ${cardsColumnWidth}px`);
                }
            },
            mouseDown(event) {
                if (!event.target.closest('.context-menu')) this.contextMenuEvent = null;
            },
            openAddCard() {
                this.backdropVisible = true;
                window.api.send('open-add-card');
            },
            openEditCard(cardId) {
                this.backdropVisible = true;
                window.api.send('open-edit-card', { cardId, parent: 'main' });
            },
            openFlashcards() {
                this.backdropVisible = true;
                window.api.send('open-flashcards');
            },
            logout() {
                window.api.invoke('logout').then((res) => {
                    window.sessionStorage.setItem('vue-data', res);
                    window.location = 'profiles.html';
                });
            },
            filterCards() {
                const text = this.$refs['filters-text'].value;
                const tags = this.$refs['filters-tags'].getValue();
                const nodes = treeManager.getSelected();
                const difficulties = [...this.filters.difficulties];
                this.filtering = true;
                window.api.invoke('filter-cards', { text, tags, nodes, difficulties }).then((cards) => {
                    this.filtering = false;
                    this.modifiedFilters = false;
                    this.cards = cards;
                    if (this.cards.length) {
                        setTimeout(() => {
                            this.$refs['cards-view'].scrollToBottom();
                        }, 0);
                    }
                });
            },
            showToast(message) {
                this.toast.message = message;
                this.toast.visible = true;
                clearTimeout(this.toast.timer);
                this.toast.timer = setTimeout(() => {
                    this.toast.visible = false;
                }, 2700);
            },
            deleteCard(cardId) {
                this.showToast('Card marked with the "deleted" tag!');
                const card = this.cards.find((c) => c._id === cardId);
                if (!card.tags.includes('deleted')) card.tags.push('deleted');
                window.api.send('update-card', JSON.stringify(card));
            },
            changeTheme(newTheme) {
                document.documentElement.classList.remove('theme-dark', 'theme-light');
                document.documentElement.classList.add(newTheme);
                window.api.send('change-theme', newTheme);
            },
            toggleFilterDifficulty(difficulty) {
                const index = this.filters.difficulties.indexOf(difficulty);
                if (index !== -1) {
                    this.filters.difficulties.splice(index, 1);
                } else {
                    this.filters.difficulties.push(difficulty);
                }
            },
        },
        watch: {
            settings: {
                deep: true,
                handler(newVal) {
                    window.api.send('update-settings', JSON.stringify(newVal));
                },
            },
        },
    };
</script>

<style scoped>
    .control-menu {
        transition: all 0.25s ease-out;
        transition-property: height, padding, margin;
        z-index: 1;
    }
    /* to avoid the bug of focusing the tags multiselect when pressing tab while the control menu is not visible: */
    .control-menu * {
        transition: all 0.25s ease-out;
    }
    .control-menu.visible * {
        visibility: visible;
    }
    .control-menu:not(.visible) * {
        visibility: hidden;
    }
    /* - */
    .dash-buttons {
        position: relative;
        background-color: inherit;
        border-top: inherit;
        margin-top: -1px;
        z-index: 2;
    }
    .backdrop {
        z-index: 3;
    }
    .dash-page {
        height: 100vh;
        overflow: hidden;
    }
    .dash-page.resizing {
        cursor: ew-resize;
    }
    .sessions-column {
        height: 100vh;
        width: 230px;
        position: relative;
        overflow-x: clip;
    }
    .cards-column {
        height: 100vh;
        overflow-x: clip;
    }
    .resize {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        cursor: ew-resize;
    }
    .menu-caret {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: transform 0.15s ease-out;
    }
    .menu-caret.rotate {
        transform: translate(-50%, -50%) rotate(180deg);
    }
    .n-sessions-selected {
        position: absolute;
        bottom: 15px;
        right: 5px;
        font-size: 0.875rem;
        border-radius: 2px;
        padding: 0 1px;
        opacity: 0;
        transition: opacity 0.25s;
    }
    .gray-info-message {
        font-size: 1.3rem;
        white-space: nowrap;
        opacity: 0.6;
    }
    .sessions-column:hover .n-sessions-selected {
        opacity: 0.95;
    }
    .percent-input {
        padding: 0 3px;
        font-size: 1rem;
        width: 3rem;
    }
    .tags-multisel {
        z-index: 0;
    }
    /* Loader animation */
    /* [https://loading.io/css/] */
    .lds-dual-ring {
        display: inline-block;
        width: 16px;
        height: 16px;
    }
    .lds-dual-ring:after {
        content: ' ';
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--default-text);
        border-color: var(--default-text) transparent var(--default-text) transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }
    .lds-dual-ring.text-dark:after {
        border: 2px solid #212529;
        border-color: #212529 transparent #212529 transparent;
    }
    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
