import path from 'path';
import fs from 'fs';

import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';

import App from '../client/App';



const PORT = process.env.PORT || 3366;
const app = express();


app.use(express.static('./build'));

app.get('/*', (req, res) => {
    const renderedApp = renderToString(<App />);

    const indexFile = path.resolve('./build/index.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Oops, better luck next time!');
        }

        return res.send(
            data.replace('<div id="root"></div>', `<div id="root">${renderedApp}</div>`)
        );
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});





    // import express, { Request, Response } from 'express';

    // import { renderToString } from 'react-dom/server';
    // import App from '../client/App';


    // const works = 'Server-Side Rendering of Plurid Applications Frontend';
    // console.log(works);
    // const app = express();

    // const PORT = process.env.PORT || 3360;


    // app.get('/*', (req: Request, res: Response) => {
    //     const reactDom = renderToString(App);

    //     res.writeHead( 200, { "Content-Type": "text/html" } );
    //     res.end(htmlTemplate(reactDom));
    // });

    // app.listen(PORT, () => {
    //     console.log(`Listening on ${PORT}`);
    // });


    // function htmlTemplate(reactDom: any) {
    //     return `
    //         <!DOCTYPE html>
    //         <html>
    //         <head>
    //             <meta charset="utf-8">
    //             <title>React SSR</title>
    //         </head>

    //         <body>
    //             <div id="app">${reactDom}</div>
    //             <script src="./app.bundle.js"></script>
    //         </body>
    //         </html>
    //     `;
    // }
