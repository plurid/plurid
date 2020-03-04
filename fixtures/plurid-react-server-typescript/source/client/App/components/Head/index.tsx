import React from 'react';

import {
    Helmet,
} from 'react-helmet-async';



interface HeadProperties {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogImage?: string;
    ogURL?: string;
    ogDescription?: string;
}

const Head: React.FC<HeadProperties> = (
    properties,
) => {
    /** properties */
    const {
        title,
        description,
        ogTitle,
        ogImage,
        ogURL,
        ogDescription,
    } = properties;

    const titleValue = title || 'Plurid\' Application';
    const descriptionValue = description || 'explore web content in three dimensions';
    const ogTitleValue = ogTitle || title || 'Plurid\' Application';
    const ogDescriptionValue = ogDescription || description || 'explore web content in three dimensions';
    const ogImageValue = ogImage || '/icon-192x192.png';
    const ogURLValue = ogURL || 'https://plurid.com';


    /** render */
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <meta name="robots" content="index,follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="description" content={descriptionValue} />

            <link rel="icon" href="/favicon.ico" />
            <link rel="shortcut icon" type="image/png" href="/icon-192x192.png" />
            <link rel="shortcut icon" sizes="192x192" href="/icon-192x192.png" />
            <link rel="apple-touch-icon" href="/icon-192x192.png" />
            <meta name="theme-color" content="#000000" />

            <link rel="manifest" href="/manifest.json" />

            <link rel="canonical" href="https://plurid.com." />

            <title>{titleValue}</title>

            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitleValue} />
            <meta property="og:image" content={ogImageValue} />
            <meta property="og:site_name" content="plurid" />
            <meta property="og:url" content={ogURLValue} />
            <meta property="og:description" content={ogDescriptionValue} />
        </Helmet>
    );
}


export default Head;
