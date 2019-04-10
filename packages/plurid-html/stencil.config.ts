import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { inlineSvg } from 'stencil-inline-svg';



export const config: Config = {
    namespace: 'plurid-html',
    copy: [
        { src: 'testing' },
    ],
    // globalStyle: 'src/styles/styles.scss',
    outputTargets: [
        { type: 'dist' },
        { type: 'docs' },
        {
            type: 'www',
            serviceWorker: null,
        },
    ],
    plugins: [
        sass(),
        inlineSvg(),
    ],
};
