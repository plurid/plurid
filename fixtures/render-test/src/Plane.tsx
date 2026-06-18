import React from 'react';

import { PluridLink } from '@plurid/plurid-react';


export interface PanelProps {
    title: string;
    code: string;
    accent: string;
    rows: [string, string][];
    /** Optional plurid link — clicking it spawns the target plane into the space. */
    link?: { route: string; label: string };
}


/**
 * A CAD-like instrument panel. Monospace, technical readout, accent rule —
 * each plane in the space reads like a module in a control surface.
 */
const Panel: React.FC<PanelProps> = ({ title, code, accent, rows, link }) => (
    <div
        style={{
            height: 360,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            background: 'linear-gradient(160deg, #15181d 0%, #0d0f12 100%)',
            color: '#e6e8ea',
            border: `1px solid ${accent}55`,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: `0 18px 50px -12px #000a, inset 0 1px 0 #ffffff0a`,
        }}
    >
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${accent}33`,
                background: '#ffffff05',
            }}
        >
            <span style={{ fontSize: 13, letterSpacing: '0.08em', fontWeight: 600 }}>
                {title}
            </span>
            <span style={{ fontSize: 11, color: accent, letterSpacing: '0.12em' }}>
                {code}
            </span>
        </div>

        <div style={{ height: 2, background: accent, opacity: 0.8 }} />

        <div style={{ padding: '16px 16px', display: 'grid', gap: 8, alignContent: 'start', flex: 1 }}>
            {rows.map(([k, v]) => (
                <div
                    key={k}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        color: '#aab2bd',
                        borderBottom: '1px dashed #ffffff10',
                        paddingBottom: 6,
                    }}
                >
                    <span>{k}</span>
                    <span style={{ color: '#e6e8ea' }}>{v}</span>
                </div>
            ))}
        </div>

        {link && (
            <div style={{ padding: '0 16px 14px' }}>
                <PluridLink
                    route={link.route}
                    style={{
                        display: 'inline-block',
                        fontSize: 11,
                        letterSpacing: '0.06em',
                        color: accent,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        borderBottom: `1px dashed ${accent}66`,
                        paddingBottom: 2,
                    }}
                >
                    {link.label} →
                </PluridLink>
            </div>
        )}

        <div
            style={{
                padding: '10px 16px',
                fontSize: 10,
                letterSpacing: '0.16em',
                color: '#6b7480',
                borderTop: '1px solid #ffffff0a',
            }}
        >
            PLURID · SPATIAL UNIT
        </div>
    </div>
);


export default Panel;
