// #region imports
    // #region libraries
    import {
        Helmet,
    } from 'react-helmet-async';

    import {
        ServerStyleSheet,
    } from 'styled-components';

    import {
        Indexed,
        PluridRoute,
        PluridComponent,
    } from '@plurid/plurid-data';

    import {
        router,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        PluridServerService,
        PluridServerServicesData,
        PluridStillerOptions,
    } from '../external';
    // #endregion external
// #endregion imports



// #region module
export interface PluridRendererConfiguration {
    htmlLanguage: string | undefined;
    htmlAttributes: Record<string, string> | undefined;
    head: string;
    defaultStyle: string | undefined;
    styles: string;
    headScripts: string | undefined;
    vendorScriptSource: string | undefined;
    mainScriptSource: string | undefined;
    bodyAttributes: string | undefined;
    root: string | undefined;
    content: string;
    windowSizerScript: string | undefined;
    defaultPreloadedReduxState: string | undefined;
    reduxState: string;
    defaultPreloadedPluridMetastate: string | undefined;
    pluridMetastate: string;
    bodyScripts: string | undefined;
}


export interface StillerOptions {
    host: string;
    routes: string[];
    configuration: StillerConfiguration;
}

export type StillerConfiguration = Pick<PluridStillerOptions, 'timeout' | 'waitUntil'>;


export interface StilledSpace {
    id: string;
    html: string;
    route: string;
    pages: Indexed<StilledPage>
}


export interface StilledPage {
    route: string;
    html: string;
    stilltime: number;
}

export interface StilledMetadataEntry {
    route: string;
    name: string;
}


export interface StillsGeneratorOptions {
    server: string;
    build: string;
}


export interface PluridContentGeneratorData {
    services: PluridServerService[];
    servicesData: PluridServerServicesData | undefined;
    stylesheet: ServerStyleSheet;
    helmet: Helmet;
    exterior: PluridComponent | undefined;
    shell: PluridComponent | undefined;
    matchedRoute: router.MatcherResponse;
    routes: PluridRoute[];
    pluridMetastate: any;
    gateway: boolean;
    gatewayEndpoint: string;
    gatewayQuery: string;
    preserveResult: any;
}


export interface RendererTemplateData {
    htmlLanguage: string;
    htmlAttributes: string;
    head: string;
    defaultStyle: string;
    styles: string;
    headScripts: string;
    vendorScriptSource: string;
    mainScriptSource: string;
    bodyAttributes: string;
    root: string;
    content: string;
    windowSizerScript: string;
    defaultPreloadedReduxState: string;
    reduxState: string;
    defaultPreloadedPluridMetastate: string;
    pluridMetastate: string;
    bodyScripts: string;
}
// #endregion module
