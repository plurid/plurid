import {
    cleanTemplate,
} from '../../utilities/template';



const resolveBackgroundStyle = (
    store: string,
) => {
    const storeJSON = JSON.parse(store);
    const generalPluridTheme = storeJSON?.themes?.general;

    if (!generalPluridTheme) {
        return {
            gradientBackground: 'hsl(220, 10%, 32%)',
            gradientForeground: 'hsl(220, 10%, 18%)',
        };
    }

    const gradientBackground = generalPluridTheme.type === 'dark'
        ? generalPluridTheme.backgroundColorTertiary
        : generalPluridTheme.backgroundColorPrimary
    const gradientForeground = generalPluridTheme.type === 'dark'
        ? generalPluridTheme.backgroundColorPrimary
        : generalPluridTheme.backgroundColorTertiary

    return {
        gradientBackground,
        gradientForeground,
    };
}

const windowSizer = `
/** PLURID WINDOW SIZER */
document.body.style.visibility = 'hidden';

const pluridRoots = document.querySelectorAll('[data-plurid-entity="PluridRoots"]');
pluridRoots.forEach(pluridRoot => {
    pluridRoot.style.width = window.innerWidth + 'px';
    pluridRoot.style.height = window.innerHeight + 'px';
});

document.body.style.visibility = 'initial';
`;


const template = (
    head: string,
    styles: string,
    content: string,
    store: string,
    root: string,
    script: string,
    vendorScript: string,
    stripeScript: string,
    htmlAttributes: string,
    bodyAttributes: string,
) => {
    const {
        gradientBackground,
        gradientForeground,
    } = resolveBackgroundStyle(store);

    const templateString = `
<!DOCTYPE html>
<html lang="en">
    <head ${htmlAttributes}>
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
    </head>
    <body ${bodyAttributes}>
        <div id="${root}">${content}</div>

        <script>
            ${windowSizer}
        </script>
        <script>
            window.__PRELOADED_STATE__ = ${store}
        </script>
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}


export default template;
