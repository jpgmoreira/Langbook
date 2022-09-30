import { createApp } from 'vue';
import VueTippy from 'vue-tippy';
import DashPage from './DashPage.vue';

import 'tippy.js/dist/tippy.css';

import '@frontend/assets/css/bootstrap.min.css';
import './tree/jstree/themes/style.css';
import '@frontend/assets/css/global.css';
import '@frontend/assets/css/dark.css';
import '@frontend/assets/css/light.css';

if (window.sessionStorage.getItem('vue-data')) {
    // dash page is loaded from the profiles page:
    const props = JSON.parse(window.sessionStorage.getItem('vue-data'));
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(props.theme);
    createApp(DashPage, props).use(VueTippy).mount('#app');
} else {
    // dash page is loaded as the initial page:
    window.api.on('set-data', (props) => {
        props = JSON.parse(props);
        document.documentElement.classList.remove('theme-dark', 'theme-light');
        document.documentElement.classList.add(props.theme);
        createApp(DashPage, props).use(VueTippy).mount('#app');
    });
}
