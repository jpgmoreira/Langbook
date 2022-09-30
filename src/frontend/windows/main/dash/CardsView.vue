<template>
    <div ref="cards-view" class="cards-view position-relative flex-fill">
        <div class="position-absolute">
            <div v-for="(card, index) in sorted" :key="card._id">
                <div class="card-number">{{ index + 1 }}</div>
                <div class="my-card" :data-card-id="card._id" @dblclick="$emit('card-edit', card._id)">
                    <div v-html="card.front"></div>
                    <div v-if="card.back.trim()" class="card-sep" v-html="card.back"></div>
                    <div v-if="card.extra.trim()" class="card-sep" v-html="card.extra"></div>
                    <div v-if="card.media.length" class="card-sep d-flex">
                        <div v-for="media in card.media" :key="media.name">
                            <tippy hideOnClick="false">
                                <template #content>{{ media.name }}</template>
                                <button type="button" class="media-btn me-1" :class="mediaClass(media)" @click="playMedia(media)"></button>
                            </tippy>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <MediaModal :path="mediaPath" :visible="mediaVisible" @close="mediaVisible = false" />
    </div>
</template>

<script>
    import mediaMixin from '@frontend/mixins/mediaMixin';
    import MediaModal from '@frontend/components/modals/MediaModal.vue';
    export default {
        emits: ['card-edit'],
        mixins: [mediaMixin],
        components: {
            MediaModal,
        },
        props: {
            cards: {
                type: Array,
                default() {
                    return [];
                },
            },
        },
        data() {
            return {
                mediaVisible: false,
                mediaPath: '',
            };
        },
        methods: {
            scrollToBottom() {
                const view = this.$refs['cards-view'];
                view.scrollTop = view.scrollHeight;
            },
        },
        computed: {
            sorted() {
                return [...this.cards].sort((a, b) => {
                    if (a.createdAt < b.createdAt) return -1;
                    if (a.createdAt > b.createdAt) return 1;
                    return 0;
                });
            },
        },
    };
</script>

<style>
    .cards-view .my-card * {
        color: inherit;
    }
</style>

<style scoped>
    .cards-view {
        overflow: auto;
    }
    .cards-view * {
        line-height: 1.3rem;
    }
    .cards-view > div {
        padding-bottom: 300px;
        width: 100%;
    }
    .card-number {
        line-height: 1rem;
        padding-left: 1px;
        margin-top: 7px;
    }
    .my-card {
        min-width: 100%;
        display: inline-block;
    }
    .my-card > div {
        padding: 3px;
    }
</style>
