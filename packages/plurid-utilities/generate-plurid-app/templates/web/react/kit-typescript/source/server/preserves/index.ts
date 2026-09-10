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
    // {
    //     serve: '*',
    //     onServe: async ({ request }) => ({ globals: { requestedAt: new Date().toISOString() } }),
    // },
];


export default preserves;
