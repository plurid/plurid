import {
    Helmet,
} from 'react-helmet-async';

import {
    ServerStyleSheet,
} from 'styled-components';

import {
    Indexed,
    PluridRouterPath,
    PluridComponent,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    PluridServerService,
    PluridServerServicesData,
} from './external';



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
    defaultPreloadedPluridState: string | undefined;
    pluridState: string;
    bodyScripts: string | undefined;
}


export interface StillerOptions {
    host: string;
    routes: string[];
}


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
    paths: PluridRouterPath[];
    pluridContext: any;
    gateway: boolean;
    gatewayEndpoint: string;
    gatewayQuery: string;
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
    defaultPreloadedPluridState: string;
    pluridState: string;
    bodyScripts: string;
}
