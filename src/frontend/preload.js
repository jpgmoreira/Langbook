import { contextBridge, ipcRenderer } from 'electron';

// https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
contextBridge.exposeInMainWorld('api', {
    send: (channel, ...data) => {
        ipcRenderer.send(channel, ...data);
    },
    invoke: (channel, ...data) => {
        return ipcRenderer.invoke(channel, ...data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (_, ...args) => func(...args));
    },
});
