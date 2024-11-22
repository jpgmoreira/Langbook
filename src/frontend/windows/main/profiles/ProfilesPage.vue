<template>
    <div class="profiles-page d-flex flex-column flex-fill">
        <div class="fs-5 text-center mt-2">Select or create a profile</div>
        <div class="table-container flex-fill position-relative mx-1">
            <div class="position-absolute overflow-auto w-100 top-0 bottom-0">
                <table v-if="hasProfile" class="w-100 table-sm table-bordered">
                    <thead>
                        <tr>
                            <th>Profile</th>
                            <th>#Sessions</th>
                            <th>#Cards</th>
                            <th>Created at</th>
                            <th>Last access</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="profile in allProfiles" :key="profile.code">
                            <tr v-if="!profile.deleted" class="cursor-pointer" @click="activeProfile = profile" :class="{ active: profile.code === activeProfile.code }">
                                <td>{{ profile.name }}</td>
                                <td>{{ profile.numSessions }}</td>
                                <td>{{ profile.numCards }}</td>
                                <td>{{ formatDate(profile.createdAt) }}</td>
                                <td>{{ formatDate(profile.lastAccess) }}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div class="fs-3 absolute-centering user-select-none" style="opacity: 0.6" v-else>Click on Create</div>
            </div>
        </div>
        <div class="d-flex justify-content-center position-relative py-2">
            <button class="btn btn-primary" @click="modals.create = true">Create</button>
            <button class="btn btn-primary ms-1" @click="selectProfile" :disabled="!activeProfile.code">Select</button>
            <button class="btn btn-primary ms-1" @click="modals.rename = true" :disabled="!activeProfile.code">Rename</button>
            <button class="btn btn-primary ms-1" @click="modals.delete = true" :disabled="!activeProfile.code">Delete</button>
            <button class="btn btn-primary position-absolute end-0 me-2" @click="modals.about = true">About</button>
        </div>
        <!-- Toast -->
        <toast :visible="toast.visible">
            {{ toast.message }}
        </toast>
        <!-- Create modal -->
        <base-modal :visible="modals.create" @close="modals.create = false">
            <template #header>Create a new profile</template>
            <template #body>
                Enter the name of the new profile:
                <input type="text" spellcheck="false" ref="create-input" form="create-form" class="form-control" placeholder="Name..." />
            </template>
            <template #footer>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary" @click="modals.create = false">Cancel</button>
                    <button class="btn btn-primary ms-1" form="create-form">Create</button>
                    <form id="create-form" v-show="false" @submit.prevent="createProfile"></form>
                </div>
            </template>
        </base-modal>
        <!-- Rename modal -->
        <base-modal :visible="modals.rename" @close="modals.rename = false">
            <template #header> Rename a profile </template>
            <template #body>
                Type the new name for the profile:
                <input type="text" spellcheck="false" ref="rename-input" form="rename-form" class="form-control" :value="activeProfile.name" placeholder="Name..." />
            </template>
            <template #footer>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary" @click="modals.rename = false">Cancel</button>
                    <button class="btn btn-primary ms-1" form="rename-form">Rename</button>
                    <form id="rename-form" v-show="false" @submit.prevent="renameProfile"></form>
                </div>
            </template>
        </base-modal>
        <!-- Delete modal -->
        <base-modal :visible="modals.delete" @close="modals.delete = false">
            <template #header> Delete a profile </template>
            <template #body>
                <div class="text-center">
                    <div style="line-height: 1rem">
                        Are you sure you want to permanently delete the profile <i>{{ activeProfile.name }}</i> ?
                    </div>
                    <div class="text-danger fs-4 my-2">This action cannot be undone!</div>
                </div>
                <div class="fine-print">To confirm the deletion, type the name of the profile and click on "Delete".</div>
                <input type="text" spellcheck="false" ref="delete-input" class="form-control mt-1" placeholder="Name..." />
            </template>
            <template #footer>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary" @click="modals.delete = false">Cancel</button>
                    <button class="btn btn-danger ms-1" @click="deleteProfile">Delete</button>
                </div>
            </template>
        </base-modal>
        <!-- About modal -->
        <base-modal :visible="modals.about" @close="modals.about = false">
            <template #header>About</template>
            <template #body>
                <div class="text-center">
                    <h3>Langbook</h3>
                    <div class="fine-print">A notebook application for studying languages and other subjects.</div>
                </div>
                <ul class="m-0 mt-5">
                    <li>Version: 1.0.0 (September 2022)</li>
                    <li>Homepage: <a href="autolinker:https://github.com/jpgmoreira/langbook">https://github.com/jpgmoreira/langbook</a></li>
                </ul>
                <textarea class="clipboard" ref="about-clipboard" @blur="$event.target.focus()"></textarea>
            </template>
            <template #footer>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary" @click="modals.about = false">Close</button>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
    import BaseModal from '@frontend/components/modals/BaseModal.vue';
    import Toast from '@frontend/components/Toast.vue';
    export default {
        components: {
            BaseModal,
            Toast,
        },
        props: {
            allProfilesProp: Array,
        },
        mounted() {
            document.title = 'Langbook';
        },
        data() {
            return {
                modals: {
                    create: false,
                    rename: false,
                    delete: false,
                    about: false,
                },
                toast: {
                    visible: false,
                    message: '',
                    timer: null,
                },
                allProfiles: this.allProfilesProp,
                activeProfile: {},
                lastOperation: 0, // Avoid multiple clicks on buttons.
            };
        },
        computed: {
            hasProfile() {
                return this.allProfiles.some((p) => !p.deleted);
            },
        },
        methods: {
            showToast() {
                this.toast.visible = true;
                clearTimeout(this.toast.timer);
                this.toast.timer = setTimeout(() => {
                    this.toast.visible = false;
                }, 2200);
            },
            createProfile() {
                if (Date.now() - this.lastOperation < 1000) return;
                this.lastOperation = Date.now();
                const name = this.$refs['create-input'].value.trim();
                if (!name) {
                    this.toast.message = 'The profile name cannot be empty!';
                    this.showToast();
                    return;
                }
                window.api
                    .invoke('create-profile', name)
                    .then((res) => {
                        window.sessionStorage.setItem('vue-data', res);
                        window.location = 'dash.html';
                    })
                    .catch(() => {
                        this.toast.message = 'A profile with this name already exists!';
                        this.showToast();
                    });
            },
            renameProfile() {
                if (Date.now() - this.lastOperation < 1000) return;
                this.lastOperation = Date.now();
                const name = this.$refs['rename-input'].value.trim();
                const code = this.activeProfile.code;
                if (!name) {
                    this.toast.message = 'The profile name cannot be empty!';
                    this.showToast();
                    return;
                }
                window.api
                    .invoke('rename-profile', { name, code: this.activeProfile.code })
                    .then(() => {
                        this.allProfiles.find((p) => p.code === code).name = name;
                        this.modals.rename = false;
                    })
                    .catch(() => {
                        this.toast.message = 'A profile with this name already exists!';
                        this.showToast();
                    });
            },
            selectProfile() {
                if (Date.now() - this.lastOperation < 1000) return;
                this.lastOperation = Date.now();
                window.api.invoke('select-profile', this.activeProfile.name).then((res) => {
                    window.sessionStorage.setItem('vue-data', res);
                    window.location = 'dash.html';
                });
            },
            deleteProfile() {
                if (Date.now() - this.lastOperation < 1000) return;
                this.lastOperation = Date.now();
                const typedName = this.$refs['delete-input'].value.trim();
                if (typedName !== this.activeProfile.name) {
                    this.toast.message = 'Incorrect profile name!';
                    this.showToast();
                    return;
                }
                window.api.invoke('delete-profile', this.activeProfile.name);
                this.allProfiles = this.allProfiles.filter((p) => p.name !== this.activeProfile.name);
                this.activeProfile = {};
                this.modals.delete = false;
            },
            formatDate(timestamp) {
                const date = new Date(timestamp);
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate().toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                return `${month} ${day}, ${year} – ${hours}:${minutes}:${seconds}`;
            },
        },
        updated() {
            if (this.modals.create) this.$refs['create-input'].focus();
            if (this.modals.rename) this.$refs['rename-input'].focus();
            if (this.modals.delete) this.$refs['delete-input'].focus();
            if (this.modals.about) this.$refs['about-clipboard'].focus();
        },
    };
</script>

<style scoped>
    .profiles-page {
        height: 100vh;
    }
    .fine-print {
        line-height: 1rem;
        font-size: 0.9rem;
        opacity: 0.7;
    }
</style>
