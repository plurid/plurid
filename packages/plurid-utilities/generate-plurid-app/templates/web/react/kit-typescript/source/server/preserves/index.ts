/**
 * Server-only work per request (data loading, redirects, per-request globals) — a typed stub.
 * Reference it from `plurid.config.ts` as a thunk so it never enters the client bundle:
 *
 *     preserves: () => import('./source/server/preserves'),
 */
import type {
    PluridPreserveReact,
} from '@plurid/plurid-react-server';



const preserves: PluridPreserveReact[] = [
    // A global's value is JavaScript source, written as `window.<name> = <value>;`: JSON-encode it.
    // {
    //     serve: '*',
    //     onServe: async () => ({ globals: { requestedAt: JSON.stringify(new Date().toISOString()) } }),
    // },
];


export default preserves;
