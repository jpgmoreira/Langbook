const fs = require('fs');
const diskFlushDelay = 500;
const diskFlushTimer = {}; // Maps filenames to timers.
const proxies = {}; // Maps strings (proxy names) to proxy objects.
const savedCount = {}; // Maps filenames to the number of times the file was saved.
const util = require('util');

const fileProxy = (fileName, proxyName, targetObj) => {
    /**
     * Every time a change is made to a proxy's properties or nested properties, its underlying object is written as JSON to 'fileName'.
     * The file may not exist, but it's parent directory must exist.
     * If the file already exists, then targetObj is ignored, and the JSON object read from the file is used as target.
     * The targetObj (target underlying object of the Proxy) may be accessed via the _target special property.
     * The minimum delay between disk writes for a same file is defined by diskFlushDelay.
     */
    if (!fs.existsSync(fileName)) fs.writeFileSync(fileName, JSON.stringify(targetObj, null, 4));
    else targetObj = JSON.parse(fs.readFileSync(fileName));
    savedCount[fileName] = 0;
    const handler = {
        get(obj, prop) {
            if (prop === '_target') {
                // Strategy to get the target underlying object of a Proxy: Access the Proxy's _target property.
                return obj;
            }
            if (!util.types.isProxy(obj[prop]) && typeof obj[prop] === 'object' && obj[prop] !== null) {
                return new Proxy(obj[prop], this);
            }
            return obj[prop];
        },
        set(obj, prop, value) {
            obj[prop] = value;
            clearTimeout(diskFlushTimer[fileName]);
            diskFlushTimer[fileName] = setTimeout(() => {
                fs.writeFileSync(fileName, JSON.stringify(targetObj, null, 4));
                savedCount[fileName]++;
                console.log(`-- ${fileName} saved! ${savedCount[fileName]}`);
            }, diskFlushDelay);
            return true;
        },
    };
    const proxyObj = new Proxy(targetObj, handler);
    proxies[proxyName] = proxyObj;
};

module.exports = {
    proxies,
    fileProxy,
};
