import React from 'react';
import {
    PluridRouterBrowser,
    PluridRouterLink,
} from '@plurid/plurid-react';


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
    { value: '/space', exterior: () => <Page name="SPACE" accent="#ffb454" to="/" toLabel="← back home" />, planes: [['/demo', () => <div style={{ padding: 24, color: '#e6e8ea' }}>a plane inside a route</div>]], view: ['/demo'] },
];


const RouterDemo: React.FC = () => (
    <PluridRouterBrowser
        // the readiness contract in the route-driven mode: the api at `onReady`, a command at once
        onReady={(api) => {
            (window as unknown as { __rtRouterReady?: unknown; __rtRouterRotation?: number }).__rtRouterReady = api;
            api.pubsub.publish({ topic: 'space.rotateXTo', data: { value: 15 } } as never);
            (window as unknown as { __rtRouterRotation?: number }).__rtRouterRotation = api.getSnapshot().space.rotationX;
        }}
        routes={routes}
        planes={[]}
    />
);


export default RouterDemo;
