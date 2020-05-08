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
        htmlLanguage,
        htmlAttributes,
        head,
        defaultStyle,
        styles,
        stripeScript,
        vendorScriptSource,
        mainScriptSource,
        headScripts,
        bodyAttributes,
        root,
        content,
        windowSizerScript,
        reduxState,
        pluridState,
        bodyScripts,
    } = data;

    const {
        gradientBackground,
        gradientForeground,
    } = resolveBackgroundStyle(reduxState);

    const defaultStyleBasic = `
        body {
            background: radial-gradient(ellipse at center, ${gradientBackground} 0%, ${gradientForeground} 100%);
            height: 100%;
            margin: 0;
        }
    `;


    const templateString = `
<!DOCTYPE html>
<html lang="${htmlLanguage}" ${htmlAttributes}>
    <head>
        ${head}

        <style>${defaultStyle}</style>

        ${styles}

        ${stripeScript}
        ${headScripts}

        <script src="${vendorScriptSource}"></script>
        <script defer src="${mainScriptSource}"></script>
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
