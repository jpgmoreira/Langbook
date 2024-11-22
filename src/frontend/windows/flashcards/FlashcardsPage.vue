<template>
    <div class="flashcards-page d-flex flex-column user-select-none">
        <div v-if="!currCard" class="no-cards d-flex flex-fill align-items-center justify-content-center">No cards left!</div>
        <div v-else class="flex-fill position-relative overflow-hidden cursor-grabbing" @wheel="wheel" @mousemove="mousemove" @click.right="resetView">
            <div class="flashcards-area position-absolute w-100" :style="cardAreaStyle">
                <div class="flashcards-field" :class="{ review: currCard.review, suspended: currCard.suspended }" v-html="currFront"></div>
                <template v-if="!onlyFront">
                    <div v-if="currBack" class="flashcards-field flashcards-sep" v-html="currBack"></div>
                    <div v-if="currCard.extra" class="flashcards-field flashcards-sep" v-html="currCard.extra"></div>
                    <div v-if="currCard.media.length" class="flashcards-sep d-flex align-items-center justify-content-center py-4">
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
                            <div class="flashcards-session-badge">
                                {{ sessions[session].name }}
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="flashcards-footer position-relative d-flex align-items-center py-1 justify-content-center">
            <div class="cards-info" v-if="currCard">
                <span v-if="!currCard.removed">Seen {{ cardsSeen }} of {{ activeCount }} cards</span>
                <span v-else>This card does not satisfy the filters anymore</span>
                <span class="mx-1">&ndash;</span>
                <span class="info-review">Review: {{ reviewCount }}</span>
                <span class="mx-1">&ndash;</span>
                <span class="info-suspended">Suspended: {{ suspendedCount }}</span>
            </div>
            <div class="d-flex align-items-center me-4">
                Difficulty:
                <div v-if="currCard && !onlyFront">
                    <select class="form-select form-select-sm ms-1 difficulty-select" :value="currCard.difficulty" @change="changeCardDifficulty">
                        <option :value="n" v-for="n in 10" :key="n">{{ n }}</option>
                    </select>
                </div>
                <div v-else>
                    <select class="form-select form-select-sm ms-1 difficulty-select" disabled>
                        <option>&#8212;</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary me-4" @click="goPrev" :disabled="prevBtnDisabled">Previous</button>
            <button class="btn btn-primary me-4" @click="goNext" :disabled="!currCard">Next</button>
            <button class="btn btn-primary me-4" @click="openEditCard" :disabled="!currCard">Edit</button>
            <div class="me-4">
                <input type="checkbox" id="review-checkbox" class="form-check-input me-1" :checked="currCard ? currCard.review : false" :disabled="checkboxesDisabled" @change="toggleReview" />
                <label for="review-checkbox">Review</label>
            </div>
            <div>
                <input type="checkbox" id="suspended-checkbox" class="form-check-input me-1" :checked="currCard ? currCard.suspended : false" :disabled="checkboxesDisabled" @change="toggleSuspended" />
                <label for="suspended-checkbox">Suspended</label>
            </div>
        </div>
        <div class="backdrop" :class="{ 'backdrop-hidden': !backdropVisible }"></div>
        <MediaModal :path="mediaPath" :visible="mediaVisible" @close="mediaVisible = false" />
        <toast :visible="toast.visible"> {{ toast.message }} </toast>
    </div>
</template>

<script>
    import mediaMixin from '@frontend/mixins/mediaMixin';
    import MediaModal from '@frontend/components/modals/MediaModal.vue';
    import Toast from '@frontend/components/Toast.vue';
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
        data() {
            return {
                backdropVisible: false,

                // - Cards and navigation:
                cards: this.cardsProp, // Array of cards.
                history: [], // Array of cards.
                reversed: [], // Array of boolean.
                historyIndex: -1, // Points to this.history.
                cardsIndex: -1, // Points to this.cards.
                reviewIndex: -1, // Points to this.cards.
                reviewCount: 0, // # of non-removed cards marked as review.
                suspendedCount: 0, // # of non-removed cards marked as suspended.
                removedCount: 0, // # of edited cards that don't satisfy the filters anymore.
                reviewProb: 0.3, // Default value.
                suspendedProb: 0.1, // Default value.
                onlyFront: true,

                // - Auxiliary to compute the number of different non-removed cards seen in the current pass:
                isPassStart: [], // Array of boolean. Indicates if history[i] is the start of a new pass in the cards.

                // - Flashcard zoom and translation:
                scale: 1.0,
                top: 70,
                left: 0,

                // - Toast:
                toast: {
                    visible: false,
                    message: '',
                },
            };
        },
        created() {
            document.title = 'Flashcards';
            document.addEventListener('keydown', this.keydown);
            window.api.on('hide-backdrop', () => {
                this.backdropVisible = false;
            });
            window.api.on('card-updated', (data) => {
                const { card, satisfyFilters } = JSON.parse(data);
                const oldCard = this.cards.find((c) => c._id === card._id);
                if (satisfyFilters) {
                    if (oldCard.removed) {
                        oldCard.removed = false;
                        this.removedCount--;
                        if (oldCard.review) this.reviewCount++;
                        if (oldCard.suspended) this.suspendedCount++;
                    }
                } else {
                    if (!oldCard.removed) {
                        oldCard.removed = true;
                        this.removedCount++;
                        if (oldCard.review) this.reviewCount--;
                        if (oldCard.suspended) this.suspendedCount--;
                    }
                }
                Object.assign(oldCard, card);
            });
            const rp = parseFloat(this.reviewProbProp) / 100;
            const sp = parseFloat(this.suspendedProbProp) / 100;
            if (Number.isNaN(rp) || Number.isNaN(sp)) {
                this.toast.message = 'Invalid review or suspended probabilities in the settings!';
                this.toast.visible = true;
            } else {
                this.reviewProb = rp;
                this.suspendedProb = sp;
            }
            this.chooseNextCard();
        },
        computed: {
            currCard() {
                return this.history[this.historyIndex];
            },
            currFront() {
                if (!this.currCard) return '';
                return this.reversed[this.historyIndex] ? this.currCard.back : this.currCard.front;
            },
            currBack() {
                if (!this.currCard) return '';
                return this.reversed[this.historyIndex] ? this.currCard.front : this.currCard.back;
            },
            activeCount() {
                return this.cards.length - this.removedCount;
            },
            cardsSeen() {
                const idSet = new Set();
                let i = this.historyIndex;
                for (; i > 0 && !this.isPassStart[i]; i--) {
                    if (!this.history[i].removed) {
                        idSet.add(this.history[i]._id);
                    }
                }
                if (this.isPassStart[i] && !this.history[i].removed) {
                    idSet.add(this.history[i]._id);
                }
                return idSet.size;
            },
            cardAreaStyle() {
                return {
                    transform: `scale(${this.scale})`,
                    top: `${this.top}px`,
                    left: `${this.left}px`,
                };
            },
            prevBtnDisabled() {
                return this.onlyFront && this.historyIndex === 0;
            },
            checkboxesDisabled() {
                return !this.currCard || this.currCard.removed;
            },
        },
        methods: {
            goNext() {
                if (!this.currCard) return;
                if (!this.onlyFront) {
                    this.historyIndex++;
                    if (this.historyIndex === this.history.length) {
                        this.chooseNextCard();
                    }
                }
                this.onlyFront = !this.onlyFront;
            },
            goPrev() {
                if (this.onlyFront) this.historyIndex--;
                this.onlyFront = !this.onlyFront;
            },
            chooseNextCard() {
                if (this.removedCount === this.cards.length) return;
                let card = null;
                let newPass = false;
                if (this.reviewCount && Math.random() < this.reviewProb) {
                    // - Choose a card marked as review.
                    do {
                        this.reviewIndex = (this.reviewIndex + 1) % this.cards.length;
                        card = this.cards[this.reviewIndex];
                    } while (card.removed || !card.review);
                } else {
                    const showSuspended = Math.random() < this.suspendedProb;
                    do {
                        this.cardsIndex = (this.cardsIndex + 1) % this.cards.length;
                        if (this.cardsIndex === 0) {
                            this.shuffle(this.cards);
                            newPass = true;
                        }
                        card = this.cards[this.cardsIndex];
                    } while (card.removed || (this.suspendedCount < this.activeCount && card.suspended && !showSuspended));
                }
                this.isPassStart.push(newPass);
                this.reversed.push(card.allowReversed && Math.random() < 0.5);
                this.history.push(card);
                this.historyIndex = this.history.length - 1;
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
                window.api.send('open-edit-card', {
                    cardId: this.currCard._id,
                    parent: 'flashcards',
                });
            },
            changeCardDifficulty(e) {
                // This enumeration of properties is necessary because "this.currCard" contains
                // properties that must not be sent to the "update-card" endpoint.
                const card = {
                    _id: this.currCard._id,
                    front: this.currCard.front,
                    back: this.currCard.back,
                    extra: this.currCard.extra,
                    difficulty: parseInt(e.target.value),
                    allowReversed: this.currCard.allowReversed,
                    createdAt: this.currCard.createdAt,
                    sessions: this.currCard.sessions,
                    tags: this.currCard.tags,
                    media: this.currCard.media,
                };
                window.api.send('update-card', JSON.stringify(card));
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
            keydown(e) {
                if (e.key === 'ArrowRight') this.goNext();
                else if (e.key === 'ArrowLeft' && !this.prevBtnDisabled) this.goPrev();
                else if (e.key === 'Escape') this.resetView();
            },
            resetView() {
                this.scale = 1.0;
                this.top = 70;
                this.left = 0;
            },
            mousemove(e) {
                if (e.buttons === 1) {
                    this.top += e.movementY;
                    this.left += e.movementX;
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
                // 2. Center at zoomed point:
                const c = { x: e.clientX, y: e.clientY };
                const vec = { x: c.x - this.left, y: c.y - this.top };
                vec.x *= this.scale / prevScale;
                vec.y *= this.scale / prevScale;
                const c2 = { x: this.left + vec.x, y: this.top + vec.y };
                this.left += c.x - c2.x;
                this.top += c.y - c2.y;
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
    .flashcards-page {
        height: 100vh;
    }
    .flashcards-footer {
        border-top: 1px solid;
    }
    .flashcards-area {
        transform-origin: 0px 0px;
    }
    .flashcards-field {
        font-size: var(--font-size);
        line-height: calc(var(--font-size) * 1.21);
        text-align: center;
        padding: 20px 0;
    }
    .flashcards-session-badge,
    .flashcards-tag-badge {
        padding: 0 8px;
        margin: 0 2px;
        border-radius: 11px;
        font-size: 0.89rem;
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
    .difficulty-select {
        width: 65px;
    }
    .no-cards {
        font-size: 2rem;
        opacity: 0.6;
    }
</style>
