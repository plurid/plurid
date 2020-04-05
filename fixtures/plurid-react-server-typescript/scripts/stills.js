const {
    StillsGenerator,
} = require('@plurid/plurid-react-server');



const main = () => {
    const stillsGenerator = new StillsGenerator();
    stillsGenerator.initialize();
}


main();
