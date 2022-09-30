<template>
    <div class="multisel-custom position-relative" :class="direction">
        <input type="text" spellcheck="false" :id="myId" :placeholder="placeholder" />
    </div>
</template>

<script>
    /**
     * - A multiselect Vue component built with selectize.js -
     * - The only dependency is jquery, install it via npm.
     * - Uses Bootstrap 5 style.
     * - Props:
     *      -> options: Array of objects in the form { text: String, value: Any };
     *      -> items: Array os strings containing the value of the pre-selected options;
     *      -> create: Allow or not the creation of new options;
     *      -> direction: 'up' or 'down'. Dropdown orientation.
     *      -> placeholder: String.
     */
    import { nanoid } from 'nanoid';
    import $ from 'jquery';
    import './selectize/selectize.js';
    import './selectize/selectize.bootstrap5.css';
    export default {
        emits: ['change'],
        props: {
            options: {
                type: Array,
                default() {
                    return [];
                },
            },
            items: {
                type: Array,
                default() {
                    return [];
                },
            },
            direction: {
                // options dropdown orientation: 'up' or 'down'.
                type: String,
                default: 'up',
            },
            create: {
                default: false,
            },
            onItemRemove: {
                default: null,
            },
            placeholder: String,
        },
        data() {
            return {
                myId: this.randomId(),
                selectizeObj: null,
            };
        },
        methods: {
            randomId() {
                return 'multiselect-' + nanoid();
            },
            getValue() {
                return JSON.parse(JSON.stringify(this.selectizeObj.items));
            },
            insertItemByCode(code) {
                if (!this.selectizeObj) return;
                this.selectizeObj.createItem(code, false);
            },
            removeOption(value) {
                if (!this.selectizeObj) return;
                this.selectizeObj.removeOption(value);
            },
            init(options, items) {
                const settings = {
                    delimiter: '@$', // a delimiter with low probability of happening inside of a real value.
                    options,
                    items,
                    plugins: ['remove_button'],
                    create: this.create,
                    onItemRemove: this.onItemRemove,
                    persist: false,
                    createOnBlur: true,
                    selectOnTab: false,
                };
                this.selectizeObj = $(`#${this.myId}`).selectize(settings)[0].selectize;
                this.selectizeObj.on('change', (value) => {
                    this.$emit(
                        'change',
                        value.split(settings.delimiter).filter((x) => x !== '')
                    );
                });
            },
        },
        mounted() {
            this.init(this.options, this.items);
        },
        watch: {
            options(v) {
                // I could not find a better way that works for updating the options.
                const newOptions = JSON.parse(JSON.stringify(v));
                const selected = this.getValue().filter((x) => newOptions.some((o) => x === o.value));
                this.selectizeObj.clearOptions(true);
                this.selectizeObj.destroy();
                this.init(newOptions, selected);
            },
        },
    };
</script>

<style>
    .multisel-custom.up .selectize-dropdown {
        /* https://stackoverflow.com/a/54865210/7974053 */
        bottom: 100% !important;
        top: auto !important;
    }
    .multisel-custom .selectize-control {
        display: flex;
    }
    .multisel-custom .selectize-input {
        min-height: 38px !important;
    }
    .multisel-custom .selectize-input.has-items {
        padding-top: 4px !important;
    }
</style>
