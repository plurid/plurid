// #region imports
    // #region libraries

    import {
        Indexed,
        PluridRoute,
        PluridRoutePlane,
        PluridPreserveResponse,
        PluridRouterProperties,
    } from '@plurid/plurid-data';

    import {
        PluridReactComponent,
        PluridDocumentRegistry,
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


export interface PluridRequestTreeData {
    services: PluridServerService[];
    exterior: PluridReactComponent | undefined;
    shell: PluridReactComponent | undefined;
    routerProperties: Partial<PluridRouterProperties<PluridReactComponent>>;
    routes: PluridRoute<PluridReactComponent>[];
    planes: PluridRoutePlane<PluridReactComponent>[];
    pluridMetastate: any;
    preserveResult: PluridPreserveResponse | undefined;
    /** The request's document registry (route / planes / in-render layers). */
    documentRegistry: PluridDocumentRegistry;
    pathname: string;
    hostname: string;
    /** The directly accessed plane's route, for a `RoutePlane` match. */
    directPlane: string | undefined;
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
