/**
 * https://github.com/akiomik/chrome-storage-promise/blob/master/src/chrome-storage-promise.js
 */
export const chromeStorage = {
    get: (keys: any): Promise<any> => {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (items) => {
                let err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                } else {
                    resolve(items);
                }
            });
        });
        return promise;
    },
    set: (items: any) => {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.set(items, () => {
                let err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
        return promise;
    },
    getBytesInUse: (keys: any) => {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.getBytesInUse(keys, (items) => {
                let err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                } else {
                    resolve(items);
                }
            });
        });
        return promise;
    },
    remove: (keys: any) => {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.remove(keys, () => {
                let err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
        return promise;
    },
    clear: () => {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.clear(() => {
                let err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
        return promise;
    }
}


export const chromeCookies = {
    get: (
        url: string,
        name: string,
    ): Promise<any> => {
        try {
            return new Promise((resolve, reject) => {
                chrome.cookies.get({
                    url,
                    name,
                },
                (cookie) => {
                    if (cookie) {
                        resolve(cookie.value);
                    } else {
                        reject(0);
                    }
                });
            });
        } catch (error) {
            return undefined;
        }
    },
}
