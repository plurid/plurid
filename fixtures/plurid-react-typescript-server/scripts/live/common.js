const common = {
    bundle: true,
    assetNames: 'assets/[name]',
    loader: {
        '.ttf': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.svg': 'file',
        '.gif': 'file',
        '.mov': 'file',
    },
    watch: {
        onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded')
        },
    },
};


module.exports = common;
