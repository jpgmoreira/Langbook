<template>
    <div class="base-modal-container" @keyup.esc="$emit('close')" @keydown.tab.prevent>
        <div class="backdrop" :class="{ 'backdrop-hidden': !visible }" @click="$emit('close')"></div>
        <transition name="modal-move">
            <div v-if="visible" class="base-modal">
                <div class="header">
                    <div>
                        <slot name="header"></slot>
                    </div>
                    <div class="modal-close" @click="$emit('close')"></div>
                </div>
                <div class="body">
                    <slot name="body"></slot>
                </div>
                <div class="footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    /**
     * - Pass as slots the 'header', 'body' and 'footer' of the modal.
     * - Pass as prop the 'visible' boolean to control visibility.
     */
    export default {
        emits: ['close'],
        props: {
            visible: {
                type: Boolean,
                required: true,
            },
        },
    };
</script>

<style scoped>
    .base-modal {
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 6px;
        min-width: 60vw;
        z-index: 6;
        --section-padding-x: 1rem;
        --section-padding-y: 1rem;
        --section-padding: var(--section-padding-y) var(--section-padding-x);
    }
    .header {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-size: 1.18rem;
    }
    .header > div:nth-child(1) {
        padding: var(--section-padding);
    }
    .modal-close {
        cursor: pointer;
        width: 1.8rem;
        height: 1.8rem;
        margin-left: auto;
        margin-right: var(--section-padding-x);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='gray' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z'/%3E%3Cpath fill-rule='evenodd' d='M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z'/%3E%3C/svg%3E");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        transition: background-image 0.25s ease-out;
    }
    .modal-close:hover {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='lightgray' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z'/%3E%3Cpath fill-rule='evenodd' d='M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z'/%3E%3C/svg%3E");
    }
    .body {
        padding: var(--section-padding);
    }
    .footer {
        padding: var(--section-padding);
    }
</style>

<style scoped>
    /* Modal movement transition */
    .modal-move-enter-active {
        animation: modal-move-animation 0.3s;
    }
    .modal-move-leave-active {
        animation: modal-move-animation 0.3s reverse;
    }
    @keyframes modal-move-animation {
        0% {
            opacity: 0;
            top: 15%;
        }
        100% {
            opacity: 1;
            top: 40%;
        }
    }
</style>
