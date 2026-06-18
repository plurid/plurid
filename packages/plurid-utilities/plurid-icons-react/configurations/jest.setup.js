const crypto = require('crypto');



Object.defineProperty(global.self, 'crypto', {
    value: {
        getRandomValues: arr => crypto.randomBytes(arr.length),
    },
});

global.fetch = require('node-fetch');
