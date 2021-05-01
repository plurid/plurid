const fs = require('fs');
const fetch = require('cross-fetch');



const base = 'http://localhost:63000';

const urls = [
    base,
    base + '/static',
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
                .replace('/', '-');
            const filename = pathname
                ? pathname + '.html'
                : 'index.html'

            const response = await fetch(url);
            const file = fs.createWriteStream(inTestPath + filename);
            response.body.pipe(file);

            file.on('close', () => {
                const toTestData = fs.readFileSync(toTestPath + filename);
                const inTestData = fs.readFileSync(inTestPath + filename);

                if (toTestData.length === inTestData.length) {
                    console.log(`\tPassed: ${url}`);
                } else {
                    console.log(`\tFailed: ${url}`);
                }
            });
        } catch (error) {
            console.log(`\tErrored: ${url}`, error);
            continue;
        }
    }
}

main();
