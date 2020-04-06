const {
    PluridStillsGenerator,
} = require('@plurid/plurid-react-server');



const main = () => {
    const stillsGenerator = new PluridStillsGenerator();
    stillsGenerator.initialize();
}


main();
