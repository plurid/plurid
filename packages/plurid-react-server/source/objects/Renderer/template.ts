import {
    cleanTemplate,
    resolveBackgroundStyle,
} from '../../utilities/template';

import {
    RendererTemplateData,
} from '../../data/interfaces';



const template = (
    data: RendererTemplateData,
) => {
    const {
        head,
        styles,
        content,
        reduxState,
        pluridState,
        root,
        script,
        windowSizerScript,
        vendorScript,
        stripeScript,
        headScripts,
        bodyScripts,
        htmlLanguage,
        htmlAttributes,
        bodyAttributes,
    } = data;

    const {
        gradientBackground,
        gradientForeground,
    } = resolveBackgroundStyle(reduxState);

    const templateString = `
<!DOCTYPE html>
<html lang="${htmlLanguage}" ${htmlAttributes}>
    <head>
        ${head}

        <style>
            body {
                background: radial-gradient(ellipse at center, ${gradientBackground} 0%, ${gradientForeground} 100%);
                height: 100%;
                margin: 0;
            }
        </style>

        ${styles}

        ${stripeScript}

        <script src="${vendorScript}"></script>
        <script defer src="${script}"></script>

        ${headScripts}
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>

        <script>
            ${windowSizerScript}
        </script>
        <script>
            window.__PRELOADED_REDUX_STATE__ = ${reduxState};
            window.__PRELOADED_PLURID_STATE__ = ${pluridState};
        </script>

        ${bodyScripts}
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}


export default template;
