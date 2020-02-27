import React from 'react';

import {
    Helmet,
} from 'react-helmet-async';



const Head = () => {
    /** render */
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <meta name="robots" content="index,follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="description" content="Plurid' Application" />

            <link rel="icon" href="/favicon.ico" />
            <link rel="shortcut icon" type="image/png" href="/icon-192x192.png" />
            <link rel="shortcut icon" sizes="192x192" href="/icon-192x192.png" />
            <link rel="apple-touch-icon" href="/icon-192x192.png" />
            <meta name="theme-color" content="#000000" />

            <link rel="manifest" href="/manifest.json" />

            <link rel="canonical" href="https://plurid.com." />

            <title>Plurid' Application</title>

            <meta property="og:type" content="website" />
            <meta property="og:title" content="plurid" />
            <meta property="og:image" content="/logo-192x192.png" />
            <meta property="og:site_name" content="plurid" />
            <meta property="og:url" content="https://plurid.com" />
            <meta property="og:description" content="explore web content in three dimensions" />
        </Helmet>
    );
}


export default Head;
