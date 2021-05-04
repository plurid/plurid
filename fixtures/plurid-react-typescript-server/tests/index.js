const fs = require('fs');
const fetch = require('cross-fetch');



const base = 'http://localhost:63000';

const urls = [
    base,
    base + '/static',
    base + '/planes',
    base + '/plane',
    base + '/planes/plane-1',
    base + '/planes/plane-2',
    base + '/parametric/0123456789',
    // base + '/not-found',
    // base + '/foo',
    base + '/general-plane',
];

const toTestPath = './tests/to-test/';
const inTestPath = './tests/in-test/';



const main = async () => {
    fs.rmSync(inTestPath, { recursive: true, force: true } );
    fs.mkdirSync(inTestPath);

    console.log('');

    for (const url of urls) {
        try {
            const pathname = url
                .replace(base, '')
                .replace(/\//g, '-');
            const filename = pathname
                ? pathname + '.html'
                : 'index.html'

            const response = await fetch(url);
            const file = fs.createWriteStream(inTestPath + filename);
            response.body.pipe(file);

            file.on('close', () => {
                try {
                    const toTestData = fs.readFileSync(toTestPath + filename);
                    const inTestData = fs.readFileSync(inTestPath + filename);

                    if (toTestData.length === inTestData.length) {
                        console.log(`\tPassed: ${url}`);
                    } else {
                        const redLog = '\x1b[31m%s\x1b[0m';
                        console.log(redLog, '\tFailed:', url);
                    }
                } catch (error) {
                    console.log(`\tErrored on file: ${url}`, error);
                }
            });
        } catch (error) {
            console.log(`\tErrored: ${url}`, error);
            continue;
        }
    }
}

main();
