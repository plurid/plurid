const template = (
    head: string,
    styles: string,
    content: string,
    store: string,
    root: string,
    script: string,
) => {
    return `
<!DOCTYPE html>
    <head>
        ${head}
        ${styles}
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
}


export default template;
