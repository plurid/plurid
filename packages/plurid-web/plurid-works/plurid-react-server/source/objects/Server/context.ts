// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridRouterProperties,
        PluridDocument,
    } from '@plurid/plurid-data';

    import {
        routing,
    } from '@plurid/plurid-engine';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridServerMiddleware,
        PluridServerService,
        PluridServerOptions,
        PluridServerTemplateConfiguration,
        PluridServerDocumentHook,
        PluridServerRenderMode,
        PluridPreserveReact,
        PTTPHandler,
    } from '~data/interfaces';

    import PluridStillsManager from '../StillsManager';
    // #endregion external
// #endregion imports



// #region module
/** Everything a request needs from the server, read-only: the modules take it, the class owns it. */
export interface PluridServerContext {
    routes: PluridRoute<PluridReactComponent>[];
    planes: PluridRoutePlane<PluridReactComponent>[];
    preserves: PluridPreserveReact[];
    services: PluridServerService[];
    exterior: PluridReactComponent | undefined;
    shell: PluridReactComponent | undefined;
    routerProperties: Partial<PluridRouterProperties<PluridReactComponent>>;
    styles: string[];
    middleware: PluridServerMiddleware[];
    options: PluridServerOptions;
    template: PluridServerTemplateConfiguration | undefined;
    templateDocument: PluridDocument;
    documentHook: PluridServerDocumentHook | undefined;
    renderMode: PluridServerRenderMode;
    pttpHandler: PTTPHandler | undefined;
    elementqlEndpoint: string | undefined;
    stills: PluridStillsManager;
    isoMatcher: routing.IsoMatcher<PluridReactComponent>;
}
// #endregion module
