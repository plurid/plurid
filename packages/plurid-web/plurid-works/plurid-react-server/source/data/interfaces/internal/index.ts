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
        PluridRoutePlane,
        PluridPreserveResponse,
    } from '@plurid/plurid-data';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridServerService,
        PluridStillerOptions,
    } from '../external';
    // #endregion external
// #endregion imports



// #region module
export interface PluridRendererConfiguration {
    htmlLanguage: string | undefined;
    htmlAttributes: string;
    head: string;
    defaultStyle: string | undefined;
    styles: string;
    headScripts: string[];
    bodyScripts: string[];
    vendorScriptSource: string | undefined;
    mainScriptSource: string | undefined;
    bodyAttributes: string | undefined;
    root: string | undefined;
    content: string;
    defaultPreloadedPluridMetastate: string | undefined;
    pluridMetastate: string;
    globals: Record<string, string> | undefined;
    minify: boolean | undefined;
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
    stylesheet: ServerStyleSheet;
    helmet: Helmet;
    exterior: PluridReactComponent | undefined;
    shell: PluridReactComponent | undefined;
    routes: PluridRoute<PluridReactComponent>[];
    planes: PluridRoutePlane<PluridReactComponent>[];
    pluridMetastate: any;
    gateway: boolean;
    gatewayEndpoint: string;
    gatewayQuery: string;
    preserveResult: PluridPreserveResponse | undefined;
    matchedPlane: any;

    pathname: string;
    hostname: string;
}


export interface RendererTemplateData {
    htmlLanguage: string;
    htmlAttributes: string;
    head: string;
    defaultStyle: string;
    styles: string;
    headScripts: string[];
    bodyScripts: string[];
    vendorScriptSource: string;
    mainScriptSource: string;
    bodyAttributes: string;
    root: string;
    content: string;
    defaultPreloadedPluridMetastate: string;
    pluridMetastate: string;
    globals: Record<string, string>;
    minify: boolean;
}
// #endregion module
