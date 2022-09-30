export default {
    data() {
        return {
            mediaVisible: false,
            mediaPath: '',
        };
    },
    methods: {
        mediaClass(media) {
            if (media.type.includes('image')) return 'media-image';
            if (media.type.includes('audio')) return 'media-audio';
            return '';
        },
        playMedia(media) {
            if (media.type.includes('audio')) {
                new Audio(media.path).play();
            } else if (media.type.includes('image')) {
                this.mediaVisible = true;
                this.mediaPath = media.path;
            }
        },
    },
};
