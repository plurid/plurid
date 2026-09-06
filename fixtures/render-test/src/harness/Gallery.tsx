import React from 'react';

import {
    FIXTURES,
    FixtureDefinition,
    FixtureViewpoint,
    fixtureQuery,
} from '../fixtures/catalog';


const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Every fixture on one page, each in its own harness (an iframe): the contact sheet. */
const Gallery = () => {
    const frames = React.useRef<Record<string, HTMLIFrameElement | null>>({});

    const show = (fixture: FixtureDefinition, viewpoint: FixtureViewpoint) => {
        const frame = frames.current[fixture.name];
        frame?.contentWindow?.postMessage({ type: 'rt-viewpoint', apply: viewpoint.apply ?? [] }, '*');
    };

    return (
        <div style={{ fontFamily: mono, color: '#e6e8ea', padding: '24px 28px' }} data-rt-gallery>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18 }}>
                <h1 style={{ fontSize: 16, letterSpacing: '0.12em', margin: 0 }}>FIXTURES · {FIXTURES.length}</h1>
                <a href="/" style={{ color: '#4da3ff', fontSize: 11, letterSpacing: '0.08em' }}>harness →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(640px, 1fr))', gap: 24 }}>
                {FIXTURES.map((fixture) => {
                    const query = fixtureQuery(fixture.name);
                    return (
                        <div key={fixture.name} style={{ border: '1px solid #ffffff18', borderRadius: 6, overflow: 'hidden', background: '#0d0f12' }} data-rt-gallery-fixture={fixture.name}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #ffffff12' }}>
                                <span style={{ fontSize: 12, letterSpacing: '0.08em' }}>{fixture.title}</span>
                                <span style={{ fontSize: 10, color: '#6b7480' }}>{fixture.name}</span>
                                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                    {fixture.viewpoints.map((viewpoint) => (
                                        <button key={viewpoint.name} type="button" onClick={() => show(fixture, viewpoint)} style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4, border: '1px solid #ffffff22', background: '#0d0f12', color: '#aab2bd', cursor: 'pointer' }}>
                                            {viewpoint.name}
                                        </button>
                                    ))}
                                    <a href={'/' + query} target="_blank" rel="noreferrer" style={{ fontSize: 10, letterSpacing: '0.08em', color: '#4da3ff', padding: '3px 4px' }}>OPEN</a>
                                </span>
                            </div>
                            <iframe
                                ref={(element) => { frames.current[fixture.name] = element; }}
                                title={fixture.title}
                                src={'/' + query}
                                loading="lazy"
                                style={{ width: '100%', aspectRatio: '16 / 10', border: 0, display: 'block', background: '#0a0c0f' }}
                            />
                            <div style={{ fontSize: 10, color: '#8a93a0', padding: '8px 12px' }}>{fixture.description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default Gallery;
