const cleanTemplate = (
    template: string,
) => {
    return template.replace(/(?:\r\n|\r|\n)/g, '');
}


const template = (
    head: string,
    styles: string,
    content: string,
    store: string,
    root: string,
    script: string,
    stripeScript: string,
) => {
    const templateString = `
<!DOCTYPE html>
    <head>
        ${head}

        <style>
            html { background:black; }
        </style>

        ${styles}

        ${stripeScript}
    </head>
    <body>
        <div id="${root}">${content}</div>
        <script>
            window.__PRELOADED_STATE__ = ${store}
        </script>
        <script src="${script}"></script>
    </body>
</html>
    `;

    return cleanTemplate(templateString);
}


export default template;
