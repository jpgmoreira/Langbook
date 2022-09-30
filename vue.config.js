const path = require('path');

module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: path.resolve(__dirname, 'src', 'frontend', 'preload.js'),
            mainProcessFile: path.resolve(__dirname, 'src', 'backend', 'main.js'),
            chainWebpackRendererProcess: (config) => {
                // Aliases applied to the renderer processes only.
                config.resolve.alias.set('@frontend', path.resolve(__dirname, 'src', 'frontend'));
            },
            chainWebpackMainProcess: (config) => {
                // Aliases applied to the main process only.
                config.resolve.alias.set('@backend', path.resolve(__dirname, 'src', 'backend'));
            },
            builderOptions: {
                asar: true,
                appId: 'com.langbook',
                productName: 'Langbook',
                icon: 'build/icons',
                linux: {
                    target: 'deb',
                    category: 'Education',
                },
                win: {
                    target: 'nsis',
                },
                mac: {
                    target: 'pkg',
                    category: 'public.app-category.education',
                },
            },
        },
    },
    pages: {
        profiles: {
            entry: './src/frontend/windows/main/profiles/profiles.js',
            template: './public/index.html',
            filename: 'profiles.html',
        },
        dash: {
            entry: './src/frontend/windows/main/dash/dash.js',
            template: './public/index.html',
            filename: 'dash.html',
        },
        editor: {
            entry: './src/frontend/windows/editor/editor.js',
            template: './public/index.html',
            filename: 'editor.html',
        },
        flashcards: {
            entry: './src/frontend/windows/flashcards/flashcards.js',
            template: './public/index.html',
            filename: 'flashcards.html',
        },
    },
    css: {
        extract: false,
    },
};
