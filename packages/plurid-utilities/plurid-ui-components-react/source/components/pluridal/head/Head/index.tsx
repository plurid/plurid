// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import {
        bridgeReduxContext,
    } from '~utilities/redux';


    import {
        StateOfAny,
        head,
    } from '@plurid/plurid-ui-state-react';
    // #endregion libraries
// #endregion imports



// #region module
export type HeadState = StateOfAny & {
    head: head.HeadState;
}

export type HeadSelectors = StateOfAny & {
    head: typeof head.selectors;
}

export interface HeadDefaults {
    robots?: string;
    viewport?: string;
    faviconIcon?: string;
    favicon16?: string;
    favicon32?: string;
    manifest?: string;
    themeColor?: string;
    apiDomain?: string;
    canonicalURL?: string;
    ogImageWidth?: string;
    ogImageHeight?: string;
    ogSiteName?: string;
    appleTouchIcon?: string;
}

export interface HeadOwnProperties {
    /**
     * The component that turns the head children into the document head — plurid-react's
     * `PluridDocument` (`<Head Document={PluridDocument} …/>`), or any Helmet-shaped component.
     */
    Document?: React.ComponentType<React.PropsWithChildren<{}>>;
    /** @deprecated Pass `Document` (a `PluridDocument`-shaped component) instead. */
    Helmet?: any;
    defaults?: Partial<head.HeadState> & HeadDefaults;
    selectors: HeadSelectors;
    context: React.Context<any>;
    children?: React.ReactNode;
}

export interface HeadStateProperties {
    stateHead: head.HeadState;
}

export interface HeadDispatchProperties {
}

export type HeadProperties =
    & HeadOwnProperties
    & HeadStateProperties
    & HeadDispatchProperties;


const Head: React.FC<HeadProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        Document,
        Helmet,
        defaults,
        children,
        // #endregion own

        // #region state
        stateHead,
        // #endregion state
    } = properties;

    const robots = defaults?.robots || 'index,follow';
    const viewport = defaults?.viewport || 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no';
    const faviconIcon = defaults?.faviconIcon ?? '/favicon.ico';
    const favicon16 = defaults?.favicon16 ?? '/favicon-16x16.png';
    const favicon32 = defaults?.favicon32 ?? '/favicon-32x32.png';
    const manifest = defaults?.manifest ?? '/site.webmanifest';
    const themeColor = defaults?.themeColor || '';

    const titleValue = stateHead.title || defaults?.title || '';
    const descriptionValue = stateHead.description || defaults?.description || '';
    const canonicalURL = stateHead.canonicalURL ||  defaults?.canonicalURL || '';

    const ogTitleValue = stateHead.ogTitle || titleValue;
    const ogDescriptionValue = stateHead.ogDescription || titleValue;
    const ogImageValue = stateHead.ogImage || defaults?.ogImage || '';
    const ogURLValue = stateHead.ogURL || defaults?.ogURL || '';

    const apiDomain = defaults?.apiDomain || '';

    const ogImageWidth = defaults?.ogImageWidth || '1200';
    const ogImageHeight = defaults?.ogImageHeight || '630';
    const ogSiteName = defaults?.ogSiteName || '';

    const appleTouchIcon = defaults?.appleTouchIcon || '';

    const {
        styles,
        scripts,
    } = stateHead;
    // #endregion properties


    // #region render
    const Renderer = Document ?? Helmet;
    if (!Renderer) {
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.warn('[plurid] <Head> needs a `Document` component (plurid-react\'s `PluridDocument`); nothing was rendered.');
        }
        return null;
    }

    return (
        <Renderer>
            <meta charSet="utf-8" />
            <meta name="robots" content={robots} />
            <meta name="viewport" content={viewport} />

            <title>{titleValue}</title>
            <meta name="title" content={titleValue} />
            <meta name="description" content={descriptionValue} />

            {apiDomain && (
                <>
                    <link rel="preconnect" href={apiDomain} />
                    <link rel="dns-prefetch" href={apiDomain} />
                </>
            )}

            {faviconIcon && (<link rel="icon" sizes="64x64" href={faviconIcon} />)}
            {favicon32 && (<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />)}
            {favicon16 && (<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />)}
            {manifest && (<link rel="manifest" href={manifest} />)}
            {themeColor && (<meta name="theme-color" content={themeColor} />)}

            {canonicalURL && (<link rel="canonical" href={canonicalURL} />)}

            {/* OPEN GRAPH */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitleValue} />
            <meta property="og:image" content={ogImageValue} />
            <meta property="og:image:width" content={ogImageWidth} />
            <meta property="og:image:height" content={ogImageHeight} />
            {ogSiteName && (<meta property="og:site_name" content={ogSiteName} />)}
            <meta property="og:url" content={ogURLValue} />
            <meta property="og:description" content={ogDescriptionValue} />

            {/* TWITTER */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={ogURLValue} />
            <meta property="twitter:title" content={ogTitleValue} />
            <meta property="twitter:description" content={ogDescriptionValue} />
            <meta property="twitter:image" content={ogImageValue} />

            {/* SAFARI */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content={titleValue} />
            {appleTouchIcon && (<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />)}

            {children}

            {styles?.map((style) => {
                return (
                    <link
                        rel="stylesheet"
                        key={'head-style' + style}
                        href={style}
                    />
                );
            })}

            {scripts?.map((script) => {
                return (
                    <script
                        key={'head-script' + script}
                        src={script}
                    />
                );
            })}
        </Renderer>
    );
    // #endregion render
}


const mapStateToProperties =(
    state: HeadState,
    ownProperties: HeadOwnProperties,
): HeadStateProperties => ({
    stateHead: ownProperties.selectors.head.getHead(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): HeadDispatchProperties => ({
});


const ConnectedHead = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Head);
// #endregion module



// #region exports
export default bridgeReduxContext(ConnectedHead, 'Head');
// #endregion exports
