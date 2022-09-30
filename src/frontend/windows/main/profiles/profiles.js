import { createApp } from 'vue';
import ProfilesPage from './ProfilesPage.vue';

import '@frontend/assets/css/bootstrap.min.css';
import '@frontend/assets/css/global.css';
import '@frontend/assets/css/dark.css';
import '@frontend/assets/css/light.css';

if (window.sessionStorage.getItem('vue-data')) {
    // profiles page is loaded from the dash page:
    const props = JSON.parse(window.sessionStorage.getItem('vue-data'));
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(props.theme);
    createApp(ProfilesPage, props).mount('#app');
} else {
    // profiles page is loaded as the initial page:
    window.api.on('set-data', (props) => {
        props = JSON.parse(props);
        document.documentElement.classList.remove('theme-dark', 'theme-light');
        document.documentElement.classList.add(props.theme);
        createApp(ProfilesPage, props).mount('#app');
    });
}
