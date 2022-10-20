const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';
const ASSETS_DIRECTORY = process.env.PLURID_ASSETS_DIRECTORY || 'assets';

const isProduction = process.env.ENV_MODE === 'production';



module.exports = {
    BUILD_DIRECTORY,
    ASSETS_DIRECTORY,

    isProduction,
};
