import { createApp } from 'vue';
import VueTippy from 'vue-tippy';
import EditorPage from './EditorPage.vue';

import 'tippy.js/dist/tippy.css';

import '@frontend/assets/css/bootstrap.min.css';
import '@frontend/assets/css/global.css';
import '@frontend/assets/css/dark.css';
import '@frontend/assets/css/light.css';

window.api.on('set-data', (props) => {
    props = JSON.parse(props);
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(props.theme);
    createApp(EditorPage, props).use(VueTippy).mount('#app');
});
