import { defineConfig } from '@plurid/plurid-kit';

import routes from './source/shared/routes';
import shell from './source/shared/shell';



/**
 * THE ONE CONFIGURATION: the routes, the shell, the document head, the server's options.
 * `plurid dev --watch` / `plurid build` / `plurid start` read it; the client and the server
 * entries project it (`createPluridClient`, `createPluridServer`).
 */
export default defineConfig({
    serverName: '__#APP_NAME#__',
    hostname: 'localhost',

    routes,
    shell,

    // services: [{ name: 'Apollo', Provider, properties, client, order }],
    // preserves: () => import('./source/server/preserves'),   // server-only, never in the client bundle

    head: {
        title: '__#APP_NAME#__',
    },
    favicon: '/favicon.ico',
    manifest: '/manifest.json',
});
