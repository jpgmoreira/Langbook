<template>
    <div class="color-picker d-flex flex-wrap justify-content-around py-1">
        <div class="color-box" v-for="color in colors" :key="color" :style="{ background: color }" @click="$emit('select', color)"></div>
    </div>
</template>

<script>
    export default {
        emits: ['select'],
        data() {
            return {
                // prettier-ignore
                colors: [
                    // red:
                    '#7f1d1d',
                    '#b91c1c',
                    '#ef4444',
                    '#fca5a5',
                    // blue:
                    '#1e40af',
                    '#2563eb',
                    '#60a5fa',
                    '#bfdbfe',
                    // yellow:
                    '#a16207',
                    '#eab308',
                    '#fde047',
                    '#fef9c3',
                    // orange:
                    '#9a3412',
                    '#ea580c',
                    '#fb923c',
                    '#fed7aa',
                    // cyan:
                    '#155e75',
                    '#0891b2',
                    '#22d3ee',
                    '#a5f3fc',
                    // green:
                    '#14532d',
                    '#15803d',
                    '#22c55e',
                    '#bbf7d0',
                    // lime:
                    '#3f6212',
                    '#65a30d',
                    '#a3e635',
                    '#d9f99d',
                    // pink:
                    '#9d174d',
                    '#db2777',
                    '#f472b6',
                    '#fbcfe8',
                    // purple:
                    '#6b21a8',
                    '#9333ea',
                    '#c084fc',
                    '#e9d5ff',
                    // gray:
                    '#1f2937',
                    '#4b5563',
                    '#9ca3af',
                    '#e5e7eb',
                    // default:
                    '#ededf0',  // dark theme default text color.
                    '#222',     // light theme default text color.
                    '#000',
                    '#fff',
                    // primary:
                    'red',
                    'green',
                    'blue',
                    'yellow',
                ],
            };
        },
    };
</script>

<style scoped>
    .color-picker {
        position: absolute;
        left: -49px;
        width: 130px;
        height: 200px;
        border: 1px solid rgb(168, 168, 168);
        background: rgb(236, 236, 236);
        overflow-y: auto;
    }
    .color-picker::-webkit-scrollbar {
        width: 2px;
        height: 2px;
    }
    .color-box {
        width: 26px;
        height: 26px;
        border: 1px solid rgba(0, 0, 0, 0.3);
        margin-bottom: 3px;
    }
    .color-box:hover {
        outline: 2px solid rgba(30, 144, 255, 0.9);
    }
</style>
