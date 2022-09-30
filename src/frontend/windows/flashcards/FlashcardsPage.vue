<template>
    <div class="flashcards-page d-flex flex-column" @keydown.right="goNext()" @keydown.left="goPrev()">
        <div v-if="!currCard" class="no-cards flex-fill d-flex align-items-center justify-content-center user-select-none">There are no cards to show</div>
        <div v-else class="flex-fill overflow-hidden cursor-grabbing" @mousemove="mousemove" @wheel="wheel" @click.right="resetView">
            <div :style="flashcardStyle" class="flashcards-area position-relative d-flex flex-column user-select-none px-3" @dragstart.prevent>
                <div class="flashcards-field" :class="{ review: currCard.review, suspended: currCard.suspended }" v-html="currFront"></div>
                <template v-if="isHolding || !onlyFront">
                    <!-- When holding the mouse button on the "Next" or "Previous" buttons, we always show all fields of the card, to avoid too much blinking on the screen. -->
                    <div v-if="currBack.trim()" class="flashcards-field flashcards-sep" v-html="currBack"></div>
                    <div v-if="currCard.extra.trim()" class="flashcards-field flashcards-sep" v-html="currCard.extra"></div>
                    <div v-if="currCard.media.length" class="flashcards-media flashcards-sep d-flex align-items-center justify-content-center">
                        <div v-for="media in currCard.media" :key="media.name">
                            <tippy hideOnClick="false">
                                <template #content>{{ media.name }}</template>
                                <button type="button" class="media-btn me-1" :class="mediaClass(media)" @click="playMedia(media)"></button>
                            </tippy>
                        </div>
                    </div>
                    <div v-if="currCard.tags.length" class="d-flex align-items-center justify-content-center mb-2">
                        <div v-for="tag in currCard.tags" :key="tag">
                            <div class="flashcards-tag-badge">{{ tag }}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center justify-content-center">
                        <div v-for="session in currCard.sessions" :key="session">
                            <div class="flashcards-session-badge">{{ sessions[session].name }}</div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="flashcards-footer position-relative mt-auto d-flex align-items-center justify-content-center py-1">
            <div class="cards-info user-select-none" v-if="currCard">
                <span v-if="!currCard.removed"> Card {{ currCard.number }} of {{ cards.length }}</span>
                <span v-else>Card do not satisfy filters anymore</span>
                <span class="mx-1">&ndash;</span>
                <span class="info-review">Review: {{ reviewCount }}</span>
                <span class="mx-1">&ndash;</span>
                <span class="info-suspended">Suspended: {{ suspendedCount }}</span>
            </div>
            <button type="button" class="btn btn-primary me-4" @mousedown="holdPrev(startHoldDelay)" @mouseup="clearTimer(goPrevTimer)" @mouseleave="clearTimer(goPrevTimer)" :disabled="prevBtnDisabled">Previous</button>
            <button type="button" class="btn btn-primary me-4" @mousedown="holdNext(startHoldDelay)" @mouseup="clearTimer(goNextTimer)" @mouseleave="clearTimer(goNextTimer)" :disabled="!currCard">Next</button>
            <div class="d-flex align-items-center justify-content-center position-relative">
                <tippy :hideOnClick="false" class="position-absolute top-0 bottom-0 w-100" v-if="currCard && cardActionsDisabled"><template #content>Cannot modify cards that do not satisfy the filters used anymore.</template></tippy>
                <button type="button" class="btn btn-primary me-4" @click="openEditCard" :disabled="backdropVisible || cardActionsDisabled">Edit</button>
                <div class="d-inline-flex me-4">
                    <input type="checkbox" id="review-checkbox" class="form-check-input me-1" :disabled="cardActionsDisabled" :checked="currCard ? currCard.review : false" @change="toggleReview" />
                    <label for="review-checkbox" class="user-select-none">Review</label>
                </div>
                <div class="d-inline-flex">
                    <input type="checkbox" id="suspended-checkbox" class="form-check-input me-1" :disabled="cardActionsDisabled" :checked="currCard ? currCard.suspended : false" @change="toggleSuspended" />
                    <label for="suspended-checkbox" class="user-select-none">Suspended</label>
                </div>
            </div>
        </div>
        <div class="backdrop" :class="{ 'backdrop-hidden': !backdropVisible }"></div>
        <MediaModal :path="mediaPath" :visible="mediaVisible" @close="mediaVisible = false" />
        <toast :visible="toast.visible"> {{ toast.message }} </toast>
        <textarea class="clipboard" ref="clipboard" @blur="$event.target.focus()"></textarea>
    </div>
</template>

<script>
    import mediaMixin from '@frontend/mixins/mediaMixin';
    import Toast from '@frontend/components/Toast.vue';
    import MediaModal from '@frontend/components/modals/MediaModal.vue';
    export default {
        mixins: [mediaMixin],
        components: {
            MediaModal,
            Toast,
        },
        props: {
            sessions: Object,
            cardsProp: Array,
            reviewProbProp: String,
            suspendedProbProp: String,
        },
        mounted() {
            this.$refs['clipboard'].focus();
        },
        data() {
            return {
                backdropVisible: false,

                // - Media modal:
                mediaVisible: false,
                mediaPath: '',

                // - Cards, card selection and navigation:
                cards: this.cardsProp, // Array of cards.
                history: [], // Array of cards.
                reversed: [], // Array of boolean. Tells if history[i] is reversed.
                reviewProb: 0.3,
                suspendedProb: 0.1,
                reverseProb: 0.5,
                reviewCount: 0,
                suspendedCount: 0,
                reviewIndex: -1, // Points to this.cards.
                normalIndex: -1, // Points to this.cards.
                historyIndex: 0, // Points to this.history.
                onlyFront: true, // If currently showing only the front of the card.

                // - Automatic navigation on mouse button hold ("next" & "previous" buttons):
                goPrevTimer: null,
                goNextTimer: null,
                holdDelay: 80, // Time between calls of goPrev and goNext when holding.
                startHoldDelay: 500, // Time to determine if the user is holding the mouse button or not.
                isHolding: false,

                // - Flashcard zooming and moving:
                scale: 1.0,
                top: 70, // relative offset.
                left: 0, // relative offset.

                // - Toast:
                toast: {
                    visible: false,
                    message: '',
                },
            };
        },
        created() {
            document.title = 'Flashcards';
            window.api.on('hide-backdrop', () => {
                this.backdropVisible = false;
            });
            window.api.on('card-updated', (data) => {
                const { card, satisfyFilters } = JSON.parse(data);
                const oldCard = this.cards.find((c) => c._id === card._id);
                if (satisfyFilters) {
                    Object.assign(oldCard, card);
                    return;
                }
                // When a card is edited and does not satisfy the filters anymore, I do not remove it from the history.
                oldCard.removed = true;
                if (oldCard.review) this.reviewCount--;
                if (oldCard.suspended) this.suspendedCount--;
                this.cards = this.cards.filter((c) => c._id !== card._id);
                this.computeCardNumbers();
                if (this.cards.length) {
                    this.reviewIndex = this.reviewIndex % this.cards.length;
                    this.normalIndex = this.normalIndex % this.cards.length;
                } else {
                    this.reviewIndex = 0;
                    this.normalIndex = 0;
                }
            });
            if (!this.cards.length) return;
            const rp = parseFloat(this.reviewProbProp) / 100;
            const sp = parseFloat(this.suspendedProbProp) / 100;
            const rpNaN = Number.isNaN(rp);
            const spNaN = Number.isNaN(sp);
            if (!rpNaN && !spNaN) {
                this.reviewProb = rp;
                this.suspendedProb = sp;
            } else {
                this.toast.visible = true;
                if (rpNaN && spNaN) this.toast.message = 'There is a problem with the review and suspended probabilities in the settings. Please review them.';
                if (rpNaN && !spNaN) this.toast.message = 'There is a problem with the review probability in the settings. Please review it.';
                if (!rpNaN && spNaN) this.toast.message = 'There is a problem with the suspended probability in the settings. Please review it.';
            }
            this.shuffle(this.cards);
            this.computeCardNumbers();
            this.chooseNextCard();
        },
        computed: {
            currCard() {
                return this.history[this.historyIndex];
            },
            currFront() {
                if (!this.currCard) return '';
                if (this.reversed[this.historyIndex]) return this.currCard.back;
                return this.currCard.front;
            },
            currBack() {
                if (!this.currCard) return '';
                if (this.reversed[this.historyIndex]) return this.currCard.front;
                return this.currCard.back;
            },
            prevBtnDisabled() {
                return this.onlyFront && this.historyIndex === 0;
            },
            cardActionsDisabled() {
                return !this.currCard || this.currCard.removed;
            },
            flashcardStyle() {
                return {
                    transform: `scale(${this.scale})`,
                    top: `${this.top}px`,
                    left: `${this.left}px`,
                };
            },
        },
        methods: {
            goPrev() {
                if (this.isHolding || this.onlyFront) {
                    if (this.historyIndex === 0) return;
                    this.historyIndex--;
                }
                if (this.isHolding) {
                    if (this.historyIndex === 0) this.onlyFront = true;
                } else this.onlyFront = !this.onlyFront;
            },
            goNext() {
                if (this.isHolding || !this.onlyFront) {
                    this.historyIndex++;
                    if (this.historyIndex >= this.history.length) this.chooseNextCard();
                }
                if (!this.currCard) this.onlyFront = true;
                else if (!this.isHolding) this.onlyFront = !this.onlyFront;
            },
            holdPrev(delay) {
                this.goPrev();
                this.goPrevTimer = setTimeout(() => {
                    this.isHolding = true;
                    this.holdPrev(this.holdDelay);
                }, delay);
            },
            holdNext(delay) {
                this.goNext();
                this.goNextTimer = setTimeout(() => {
                    this.isHolding = true;
                    this.holdNext(this.holdDelay);
                }, delay);
            },
            clearTimer(timer) {
                this.isHolding = false;
                clearTimeout(timer);
            },
            chooseNextCard() {
                if (!this.cards.length) return;
                if (this.reviewCount && Math.random() < this.reviewProb) {
                    while (true) {
                        this.reviewIndex = (this.reviewIndex + 1) % this.cards.length;
                        if (this.cards[this.reviewIndex].review) break;
                    }
                    const card = this.cards[this.reviewIndex];
                    this.history.push(card);
                    this.historyIndex = this.history.length - 1;
                    this.reversed.push(card.allowReversed && Math.random() < this.reverseProb);
                    return;
                }
                let card = null;
                for (let i = 0; i < this.cards.length; i++) {
                    this.normalIndex = (this.normalIndex + 1) % this.cards.length;
                    card = this.cards[this.normalIndex];
                    if (!card.suspended || this.suspendedCount === this.cards.length || Math.random() < this.suspendedProb) break;
                }
                this.history.push(card);
                this.historyIndex = this.history.length - 1;
                this.reversed.push(card.allowReversed && Math.random() < this.reverseProb);
            },
            toggleReview() {
                if (this.currCard.suspended) this.suspendedCount--;
                this.currCard.suspended = false;
                this.reviewCount += this.currCard.review ? -1 : 1;
                this.currCard.review = !this.currCard.review;
            },
            toggleSuspended() {
                if (this.currCard.review) this.reviewCount--;
                this.currCard.review = false;
                this.suspendedCount += this.currCard.suspended ? -1 : 1;
                this.currCard.suspended = !this.currCard.suspended;
            },
            openEditCard() {
                this.backdropVisible = true;
                window.api.send('open-edit-card', { cardId: this.currCard._id, parent: 'flashcards' });
            },
            shuffle(arr) {
                // [https://stackoverflow.com/a/2450976/7974053]
                let currentIndex = arr.length;
                let randomIndex;
                while (currentIndex != 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;
                    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
                }
                return arr;
            },
            computeCardNumbers() {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].number = i + 1;
                }
            },
            wheel(e) {
                e.preventDefault();
                // 1. Scale:
                const prevScale = this.scale;
                const factor = e.ctrlKey ? 60 : 6;
                let val = this.scale / factor;
                if (e.deltaY > 0) val *= -1;
                this.scale = Math.max(this.scale + val, 0.1);
                // 2. Center on zoomed point:
                const c = { x: e.clientX, y: e.clientY };
                const vec = { x: c.x - this.left, y: c.y - this.top };
                vec.x *= this.scale / prevScale;
                vec.y *= this.scale / prevScale;
                const c2 = { x: this.left + vec.x, y: this.top + vec.y };
                this.left += c.x - c2.x;
                this.top += c.y - c2.y;
            },
            mousemove(e) {
                if (e.buttons === 1) {
                    this.top += e.movementY;
                    this.left += e.movementX;
                }
            },
            resetView() {
                this.top = 70;
                this.left = 0;
                this.scale = 1.0;
            },
        },
        watch: {
            prevBtnDisabled(newVal) {
                if (newVal) this.clearTimer(this.goPrevTimer);
            },
            currCard(newVal) {
                if (!newVal) this.clearTimer(this.goNextTimer);
            },
        },
    };
</script>

<style>
    /* Correct font sizes on the flashcards fields. */
    .flashcards-page .flashcards-field {
        --font-size: 1.5rem;
        --font-size-step: 0.5rem;
    }
    .flashcards-page .flashcards-field span[style*='font-size: x-small'] {
        font-size: calc(var(--font-size) - 1 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: small'] {
        font-size: calc(var(--font-size) - 0.55 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: medium'] {
        font-size: calc(var(--font-size) - 0 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: large'] {
        font-size: calc(var(--font-size) + 1 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: x-large'] {
        font-size: calc(var(--font-size) + 2 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: xx-large'] {
        font-size: calc(var(--font-size) + 3 * var(--font-size-step)) !important;
    }
    .flashcards-page .flashcards-field span[style*='font-size: xxx-large'] {
        font-size: calc(var(--font-size) + 4 * var(--font-size-step)) !important;
    }
    /* Correct text colors. */
    .flashcards-page .flashcards-field span {
        color: inherit;
    }
</style>

<style scoped>
    .no-cards {
        font-size: 2rem;
        opacity: 0.6;
    }
    .flashcards-page {
        height: 100vh;
    }
    .flashcards-field {
        font-size: var(--font-size);
        line-height: calc(var(--font-size) * 1.21);
        text-align: center;
        padding: 20px 0;
    }
    .flashcards-media {
        padding: 15px 0;
    }
    .flashcards-session-badge,
    .flashcards-tag-badge {
        padding: 0 8px;
        margin: 0 2px;
        border-radius: 11px;
        font-size: 0.89rem;
    }
    .flashcards-area {
        transform-origin: 0px 0px;
    }
    .flashcards-footer {
        border-top: 1px solid;
    }
    .cards-info {
        position: absolute;
        bottom: calc(100% + 1px);
        right: 0;
        border-top: 1px solid;
        border-left: 1px solid;
        font-size: 0.875rem;
        padding: 3px 5px;
    }
</style>
