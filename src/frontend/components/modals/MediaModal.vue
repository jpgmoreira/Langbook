<template>
    <div @wheel="wheel" @click="$emit('close')" @keyup.esc="$emit('close')" @keydown.tab.prevent>
        <div class="backdrop" :class="{ 'backdrop-hidden': !visible }"></div>
        <transition name="media-modal-transition">
            <div v-if="visible" class="media-modal">
                <img :src="path" ref="image" />
            </div>
        </transition>
        <textarea class="clipboard" ref="clipboard"></textarea>
    </div>
</template>

<script>
    export default {
        emits: ['close'],
        props: {
            visible: {
                type: Boolean,
                required: true,
            },
            path: {
                type: String,
                required: true,
            },
        },
        methods: {
            wheel(event) {
                const image = this.$refs['image'];
                if (!image) return;
                const step = 25;
                if (image.width > image.height) {
                    if (event.deltaY > 0) image.width -= step;
                    else if (event.deltaY < 0) image.width += step;
                } else {
                    if (event.deltaY > 0) image.height -= step;
                    else if (event.deltaY < 0) image.height += step;
                }
            },
        },
        watch: {
            visible(newVal) {
                if (newVal) {
                    this.$refs['clipboard'].focus();
                }
            },
        },
    };
</script>

<style scoped>
    .media-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: snow;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid #aaa;
    }
    .media-modal img {
        max-width: 90vw;
        max-height: 90vh;
    }
    .media-modal-transition-enter-active {
        animation: media-modal-animation 0.2s;
    }
    .media-modal-transition-leave-active {
        animation: media-modal-animation 0.2s reverse;
    }
    @keyframes media-modal-animation {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    .backdrop {
        z-index: 3;
    }
    .media-modal {
        z-index: 4;
    }
</style>
