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
    canonicalURL?: string;
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
        canonicalURL,
    } = properties;

    const titleValue = title || `Plurid' Application`;
    const descriptionValue = description || 'explore web content in three dimensions';
    const ogTitleValue = ogTitle || title || `Plurid' Application`;
    const ogDescriptionValue = ogDescription || description || 'explore web content in three dimensions';
    const ogImageValue = ogImage || '/icon-192x192.png';
    const ogURLValue = ogURL || 'https://plurid.com';

    const apiDomain = 'https://api.plurid.com/graphql';


    /** render */
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <meta name="robots" content="index,follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="description" content={descriptionValue} />

            <link rel="preconnect" href={apiDomain} />
            <link rel="dns-prefetch" href={apiDomain} />

            <link rel="icon" href="/favicon.ico" sizes="64x64" />
            <link rel="shortcut icon" type="image/png" href="/icon-192x192.png" />
            <link rel="shortcut icon" sizes="192x192" href="/icon-192x192.png" />
            <meta name="theme-color" content="#000000" />

            <link rel="manifest" href="/manifest.json" />

            {canonicalURL && (
                <link rel="canonical" href={canonicalURL} />
            )}

            <title>{titleValue}</title>

            {/* OPEN GRAPH */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitleValue} />
            <meta property="og:image" content={ogImageValue} />
            <meta property="og:site_name" content="plurid" />
            <meta property="og:url" content={ogURLValue} />
            <meta property="og:description" content={ogDescriptionValue} />

            {/* SAFARI */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <meta name="apple-mobile-web-app-title" content={titleValue} />
            <link rel="apple-touch-icon" href="/icon-192x192.png" />
        </Helmet>
    );
}


export default Head;
