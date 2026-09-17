import React from 'react';
import {
    PluridApplicationProvider,
    PluridRouterBrowser,
    PluridRouterLink,
} from '@plurid/plurid-react';

import { installHarnessGlobals } from './harness/globals';
import { readFlags } from './harness/flags';


// A page "exterior" — the SPA content shown for a route. Each carries a PluridRouterLink
// that navigates (in-place, no full reload) to the other route, updating the URL + history.
const Page: React.FC<{ name: string; accent: string; to: string; toLabel: string }> = ({
    name, accent, to, toLabel,
}) => (
    <div
        style={{
            position: 'fixed', inset: 0,
            display: 'grid', placeContent: 'center', gap: 18,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            background: 'radial-gradient(1200px 600px at 50% 30%, #15181d 0%, #0a0c0f 100%)',
            color: '#e6e8ea', textAlign: 'center',
        }}
    >
        <div style={{ fontSize: 13, letterSpacing: '0.3em', color: accent }}>PLURID · ROUTER</div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '0.04em' }}>{name}</div>
        <div data-rt-route style={{ fontSize: 12, color: '#6b7480' }}>
            url: {typeof window !== 'undefined' ? window.location.pathname : '/'}
        </div>
        <PluridRouterLink
            route={to}
            style={{
                marginTop: 8, fontSize: 14, letterSpacing: '0.06em', color: accent,
                cursor: 'pointer', textDecoration: 'none',
                borderBottom: `1px dashed ${accent}66`, paddingBottom: 3,
            }}
        >
            {toLabel}
        </PluridRouterLink>
    </div>
);


const routes: any[] = [
    { value: '/', exterior: () => <Page name="HOME" accent="#4da3ff" to="/about" toLabel="go to about →" /> },
    { value: '/about', exterior: () => <Page name="ABOUT" accent="#7ee787" to="/" toLabel="← back home" /> },
    // a route WITH an application: the readiness contract in the route-driven mode (navigation.spec.ts)
    // and the PEER scenarios (router.spec.ts): a second root, a spawned child, an arrangement kept
    {
        value: '/space',
        exterior: () => <Page name="SPACE" accent="#ffb454" to="/" toLabel="← back home" />,
        planes: [
            ['/demo', () => <div style={{ padding: 24, color: '#e6e8ea' }}>a plane inside a route</div>],
            ['/second', () => <div style={{ padding: 24, color: '#e6e8ea' }}>a second plane inside the route</div>],
            ['/demo/detail', () => <div style={{ padding: 24, color: '#e6e8ea' }}>a detail of the first</div>],
        ],
        view: ['/demo'],
    },
];


/** A host's toolbar slot: the same one the direct fixture's chrome tests draw, so the peer can be told apart. */
const renderHostToolbar = (context: any) => (
    <div data-plurid-overlay="host-toolbar" data-look={context?.look?.name} style={{ position: 'absolute', left: 16, bottom: 16, color: '#e6e8ea', fontSize: 12 }}>
        host toolbar
    </div>
);


/**
 * THE ROUTER PEER: the same provider a product wraps its router in (one configuration surface for
 * both mount paths), the same harness globals the direct fixture installs, so the scenario suite
 * reads the route-driven space the way it reads the direct one.
 */
const RouterDemo: React.FC = () => (
    <PluridApplicationProvider
        renderToolbar={renderHostToolbar as any}
        useLocalStorage={true}
    >
        <PluridRouterBrowser
            // the readiness contract in the route-driven mode: the api at `onReady`, a command at once
            onReady={(api) => {
                (window as unknown as { __rtRouterReady?: unknown; __rtRouterRotation?: number }).__rtRouterReady = api;
                api.pubsub.publish({ topic: 'space.rotateXTo', data: { value: 15 } } as never);
                (window as unknown as { __rtRouterRotation?: number }).__rtRouterRotation = api.getSnapshot().space.camera.pitch;
                installHarnessGlobals(api, readFlags(location.search, () => undefined), {});
            }}
            routes={routes}
            planes={[]}
        />
    </PluridApplicationProvider>
);


export default RouterDemo;
