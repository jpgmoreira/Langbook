<!-- prettier-ignore -->
<template>
    <div class="root d-flex flex-column">
        <div class="rte-parent d-flex flex-column flex-fill position-relative" :class="{ empty }">
            <div v-if="empty" class="rte-placeholder"> {{ placeholder }} </div>
            <div v-if="contextMenuVisible" :style="contextMenuStyle" class="context-menu position-absolute">
                <div>
                    <div @mousedown="contextMenuCut">Cut</div>
                    <div @mousedown="contextMenuCopy">Copy</div>
                    <div @mousedown="contextMenuPaste">Paste</div>
                </div>
            </div>
            <div class="rte flex-fill"
                ref="rte"
                spellcheck="false"
                contenteditable="true"
                @paste="paste"
                @drop="drop"
                @keydown="keydown"
                @input="input"
                @contextmenu="contextmenu"
                @blur="blur"
                @click="contextMenuVisible = false"
                @wheel="contextMenuVisible = false"
                v-html="initial"
            ></div>
        </div>
        <div ref="toolbar" class="toolbar d-inline-flex" @mousedown="toolbarMousedown">
            <div class="toolbar-btn toolbar-undo"></div>
            <div class="toolbar-btn toolbar-redo"></div>
            <div class="toolbar-btn toolbar-bold"></div>
            <div class="toolbar-btn toolbar-italic"></div>
            <div class="toolbar-btn toolbar-underline"></div>
            <div class="toolbar-btn toolbar-strikeThrough"></div>
            <div class="toolbar-btn toolbar-superscript"></div>
            <div class="toolbar-btn toolbar-subscript"></div>
            <div class="toolbar-btn toolbar-clear"></div>
            <div class="toolbar-btn toolbar-resize">
                <div class="font-sizes toolbox" v-if="currentDropdown === 'resize'">
                    <div v-for="i in 7" :key="i" @click="resizeText(i)">
                        {{ i }}
                    </div>
                </div>
            </div>
            <div class="toolbar-btn toolbar-textcolor">
                <ColorPicker class="toolbox" @select="setTextColor($event)" v-if="currentDropdown === 'textcolor'" />
            </div>
            <div class="toolbar-btn toolbar-backgroundcolor">
                <ColorPicker class="toolbox" @select="setTextBackground($event)" v-if="currentDropdown === 'backgroundcolor'" />
            </div>
        </div>
    </div>
</template>

<script>
    import { stripHtml } from 'string-strip-html';
    import ColorPicker from './ColorPicker.vue';
    export default {
        props: {
            initial: String,
            placeholder: String,
        },
        components: {
            ColorPicker,
        },
        data() {
            return {
                empty: false,
                contextMenuVisible: false,
                contextMenuStyle: {},
                currentDropdown: null, // 'resize', 'textcolor', 'backgroundcolor'.
            };
        },
        mounted() {
            document.execCommand('styleWithCSS');
            this.empty = ['', '<br>', '<div><br></div>'].includes(this.initial);
            // Bind click events:
            this.$el.addEventListener('click', (e) => {
                const element = e.target;
                const si = this.$refs['rte'].querySelector('.selected-image');
                if (si) si.classList.remove('selected-image');
                if (element.tagName === 'IMG' && element !== si) {
                    element.classList.add('selected-image');
                }
                if (!element.closest('.font-sizes,.color-picker')) {
                    this.currentDropdown = null;
                }
                if (element.classList.contains('toolbar-resize')) {
                    this.currentDropdown = 'resize';
                } else if (element.classList.contains('toolbar-textcolor')) {
                    this.currentDropdown = 'textcolor';
                } else if (element.classList.contains('toolbar-backgroundcolor')) {
                    this.currentDropdown = 'backgroundcolor';
                }
            });
            // Set wheel events for the images already contained in the editor:
            const initialImages = this.$refs['rte'].querySelectorAll('img');
            initialImages.forEach((image) => {
                image.addEventListener('wheel', this.imageResize);
            });
            // Remove all attributes from pasted img elements except from src.
            new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.tagName === 'IMG') {
                            for (let i = 0; i < node.attributes.length; i++) {
                                if (node.attributes[i].name !== 'src') node.removeAttributeNode(node.attributes[i]);
                            }
                            // resizing:
                            node.addEventListener('wheel', this.imageResize);
                        }
                    });
                });
            }).observe(this.$refs['rte'], { childList: true, subtree: true });
        },
        methods: {
            paste(e) {
                e.preventDefault();
                // 1. Check if pasting an image from the clipboard:
                const items = e.clipboardData.items;
                if (items && items.length && items[0].kind === 'file' && items[0].type.startsWith('image/')) {
                    console.log('-> paste an image from the clipboard.');
                    const reader = new FileReader();
                    reader.onload = (fileEvent) => {
                        document.execCommand('insertImage', false, fileEvent.target.result);
                    };
                    reader.readAsDataURL(items[0].getAsFile());
                    return;
                }
                // 2. Check if pasting HTML content.
                // No HTML content other than images is allowed.
                // It's possible to paste HTML tags as plaintext, but if there is an image tag in the content, then other HTML tags will be stripped.
                const html = e.clipboardData.getData('text/html').trim();
                if (html && html.includes('<img ')) {
                    console.log('-> paste as HTML.');
                    const stripped = stripHtml(html, { ignoreTags: ['img'] }).result;
                    setTimeout(() => {
                        document.execCommand('insertHTML', false, stripped);
                    }, 0);
                    return;
                }
                // 3. Paste as plaintext:
                const text = e.clipboardData.getData('text/plain').trim();
                if (text) {
                    console.log('-> paste as plaintext');
                    setTimeout(() => {
                        document.execCommand('insertText', false, text);
                    }, 0);
                }
            },
            drop(e) {
                // Due to some problems and difficulties related to drop events in JavaScript, the only thing you are allowed to drop
                //   in a card's field are image files from your operating system.
                e.preventDefault();
                for (const item of e.dataTransfer.items) {
                    if (item.kind === 'file' && item.type.startsWith('image/')) {
                        console.log('-> drop an image from the operating system.');
                        const reader = new FileReader();
                        reader.onload = (fileEvent) => {
                            this.focus();
                            document.execCommand('insertImage', false, fileEvent.target.result);
                        };
                        reader.readAsDataURL(item.getAsFile());
                    }
                }
            },
            keydown(e) {
                // Allowed keyboard hotkeys:
                // - CTRL + c: Copy.
                // - CTRL + v: Paste.
                // - CTRL + z: Undo.
                // - CTRL + y: Redo.
                // - CTRL + b: Toggle bold.
                // - CTRL + i: Toggle italic.
                // - CTRL + u: Toggle underline.
                // - CTRL + a: Select all.
                // - CTRL + s: Toggle strikethrough.
                // - CTRL + <arrow_keys>: Jump whole words.
                // - CTRL + SHIFT + <arrow_keys>: Jump whole words selecting.
                const key = e.key.toLowerCase();
                if (e.ctrlKey) {
                    switch (key) {
                        case 'c':
                        case 'v':
                        case 'z':
                        case 'y':
                        case 'b':
                        case 'i':
                        case 'u':
                        case 'a':
                        case 'arrowup':
                        case 'arrowdown':
                        case 'arrowleft':
                        case 'arrowright':
                            break;
                        case 's':
                            document.execCommand('strikeThrough');
                            break;
                        default:
                            e.preventDefault();
                    }
                } else {
                    if (key === 'tab') {
                        e.preventDefault();
                        document.execCommand('insertText', false, ' '.repeat(8));
                    }
                }
            },
            input() {
                this.empty = ['', '<br>', '<div><br></div>'].includes(this.$refs['rte'].innerHTML);
            },
            toolbarMousedown(e) {
                e.preventDefault();
                const cl = e.target.classList;
                if (cl.contains('toolbar-bold')) {
                    document.execCommand('bold');
                } else if (cl.contains('toolbar-italic')) {
                    document.execCommand('italic');
                } else if (cl.contains('toolbar-underline')) {
                    document.execCommand('underline');
                } else if (cl.contains('toolbar-strikeThrough')) {
                    document.execCommand('strikeThrough');
                } else if (cl.contains('toolbar-superscript')) {
                    document.execCommand('superscript');
                } else if (cl.contains('toolbar-subscript')) {
                    document.execCommand('subscript');
                } else if (cl.contains('toolbar-undo')) {
                    document.execCommand('undo');
                } else if (cl.contains('toolbar-redo')) {
                    document.execCommand('redo');
                } else if (cl.contains('toolbar-clear')) {
                    const selection = window.getSelection();
                    if (selection.type === 'Caret') {
                        // the current selection is collapsed.
                        document.execCommand('insertText', false, ' ');
                        selection.modify('extend', 'left', 'character');
                    }
                    // trick to remove subscript and superscript.
                    document.execCommand('superscript');
                    document.execCommand('subscript');
                    document.execCommand('subscript');
                    // necessary to call twice because of a bug with clearing the text background color.
                    document.execCommand('removeFormat');
                    document.execCommand('removeFormat');
                }
            },
            setTextColor(color) {
                document.execCommand('foreColor', false, color);
            },
            setTextBackground(color) {
                document.execCommand('backColor', false, color);
            },
            resizeText(size) {
                document.execCommand('fontSize', false, size);
            },
            getValue() {
                return this.empty ? '' : this.$refs['rte'].innerHTML;
            },
            contextmenu(e) {
                const rect = e.currentTarget.getBoundingClientRect();
                const rl = rect.left,
                    rr = rect.right,
                    rt = rect.top,
                    cx = e.clientX,
                    cy = e.clientY;
                this.contextMenuStyle = { top: cy - rt + 'px' };
                if (rr - cx > 70) this.contextMenuStyle.left = cx - rl + 'px';
                else this.contextMenuStyle.right = rr - cx + 'px';
                this.contextMenuVisible = true;
            },
            blur() {
                this.currentDropdown = null;
                this.contextMenuVisible = false;
                const si = this.$refs['rte'].querySelector('.selected-image');
                if (si) si.classList.remove('selected-image');
            },
            focus() {
                this.$refs['rte'].focus();
            },
            contextMenuCopy() {
                document.execCommand('copy');
            },
            contextMenuPaste() {
                document.execCommand('paste');
            },
            contextMenuCut() {
                document.execCommand('cut');
            },
            imageResize(e) {
                const node = e.target;
                if (node.classList.contains('selected-image')) {
                    e.preventDefault();
                    const factor = e.ctrlKey ? 60 : 6;
                    let scale = node.width ? node.width / factor : 10;
                    if (e.deltaY > 0) scale *= -1;
                    node.width += scale;
                }
            },
        },
    };
</script>

<style>
    .rte .selected-image {
        outline: 5px solid rgba(30, 144, 255, 0.3);
    }
    .rte span {
        color: inherit;
    }
</style>

<style scoped>
    .root .toolbar {
        visibility: hidden;
    }
    .root:focus-within .toolbar {
        visibility: visible;
    }
    .rte {
        line-height: 1.3rem;
        padding: 4px 5px;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
    }
    .toolbar {
        border: 1px solid #999;
        background: rgb(228, 228, 228);
        padding: 3px;
        width: fit-content;
        position: sticky;
        left: 0;
        bottom: 0;
        margin-bottom: -33px;
    }
    .toolbar .toolbox {
        top: 100%;
        bottom: auto;
    }
    .toolbar.sticky .toolbox {
        top: auto;
        bottom: 100%;
    }
    .toolbar-btn {
        width: 25px;
        height: 25px;
        padding: 1px;
        margin: 0 3px;
        cursor: pointer;
        background-size: cover;
        position: relative;
        background-repeat: no-repeat;
        background-position: center;
        background-origin: content-box;
    }
    .toolbar-btn:hover,
    .toolbar-btn.active {
        background-color: #fff;
        outline: 2px dotted rgb(30, 144, 255, 0.6);
    }
    .font-sizes {
        border: 1px solid rgb(168, 168, 168);
        background: rgb(236, 236, 236);
        padding: 3px 0;
        width: 50px;
        position: absolute;
        left: -50%;
    }
    .font-sizes div {
        color: #333;
        padding: 0;
        margin: 0;
        line-height: 1.4rem;
        text-align: center;
        font-weight: bold;
    }
    .font-sizes div:hover {
        background: #fff;
    }
    .context-menu > div > div {
        padding: 3px 7px;
        line-height: 1rem;
        cursor: pointer;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
    }
    /* z-index: */
    .rte-placeholder {
        z-index: 0;
    }
    .rte {
        z-index: 1;
    }
    .toolbar {
        z-index: 3;
    }
    .context-menu {
        z-index: 4;
    }
</style>
