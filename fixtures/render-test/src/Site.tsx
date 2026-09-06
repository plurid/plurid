import React from 'react';

import {
    PluridLink,
    usePluridPlane,
} from '@plurid/plurid-react';


/**
 * THE SITE SET: what a consumer's site looks like in the page presentation — a dark, ordinary
 * page (a header with navigation, a hero, long prose, a footer) that fills the view and scrolls,
 * whose navigation links are plurid links. Deterministic content (the visual baselines).
 */
const ACCENTS = ['#4da3ff', '#ffb454', '#7ee787'];

const SENTENCES = [
    'A page is a sheet in a space it does not have to show.',
    'The camera is docked on it: face-on, at scale one, filling the view to the pixel.',
    'Scrolling is the page\'s own; the space waits one move away.',
    'A link does not replace the page, it opens the next one behind it and the camera swings around.',
    'The chrome stays out of the picture until the space is revealed.',
    'Escape brings the page back; the corner control, a pinch or the G key take the space out.',
    'Nothing here is a mode: the pose of the camera is the whole state.',
    'Every page keeps its width, its height and its scroll position while the space turns.',
    'Two links in one header open two pages behind the site; docked on one, the other steps aside.',
    'The rail at the corner is the whole chrome of a page: fit, back, and the door into the space.',
    'A scrolled link keeps its page where it was; the bridge follows the link to the fold and rests there.',
    'Reveal the space and the pages are sheets again, each where its link put it.',
];

// a stride coprime with the pool size: consecutive paragraphs never repeat a run of sentences
const paragraph = (seed: number) => Array.from({ length: 4 }, (_, i) => SENTENCES[(seed * 5 + i * 3) % SENTENCES.length]).join(' ');

export type SiteTheme = 'dark' | 'light';
export interface SiteOptions {
    theme?: SiteTheme;
    stickyHeader?: boolean;
}
const PALETTES = {
    dark: { background: '#101317', color: '#e6e8ea', rule: '#ffffff14', muted: '#6b7480', lead: '#aab2bd' },
    light: { background: '#f6f5f1', color: '#1c1c1a', rule: '#dcdad3', muted: '#6b6a64', lead: '#4a4944' },
} as const;

const SECTIONS = ['Sheets', 'Docking', 'Scroll', 'Links', 'Chrome', 'The reveal', 'Pose', 'Sizes', 'Motion', 'Return'];

const fontBody = 'Georgia, "Times New Roman", serif';
const fontUI = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const pageStyle = (palette: typeof PALETTES[SiteTheme]): React.CSSProperties => ({
    minHeight: '100%',
    boxSizing: 'border-box',
    background: palette.background,
    color: palette.color,
    fontFamily: fontBody,
    fontSize: 17,
    lineHeight: 1.6,
});

const headerStyle = (accent: string, palette: typeof PALETTES[SiteTheme], sticky: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    height: 64,
    fontFamily: fontUI,
    // the accent is a rule under the header, not a band on the view's edge
    borderBottom: `2px solid ${accent}`,
    boxShadow: `0 1px 0 ${palette.rule}`,
    ...(sticky ? { position: 'sticky' as const, top: 0, background: palette.background, zIndex: 1 } : {}),
});

const navLinkStyle = (accent: string): React.CSSProperties => ({
    fontFamily: fontUI,
    fontSize: 14,
    letterSpacing: '0.04em',
    color: accent,
    textDecoration: 'none',
    borderBottom: `1px solid ${accent}66`,
    paddingBottom: 2,
    cursor: 'pointer',
});

const columnStyle: React.CSSProperties = {
    maxWidth: 680,
    margin: '0 auto',
    padding: '0 24px',
};

const Prose = ({ sections, seed }: { sections: string[]; seed: number }) => (
    <div style={columnStyle}>
        {sections.map((title, index) => (
            <section key={title} style={{ padding: '28px 0 8px' }}>
                <h2 style={{ fontFamily: fontUI, fontSize: 22, margin: '0 0 12px', fontWeight: 600 }}>{title}</h2>
                <p style={{ margin: '0 0 14px' }}>{paragraph(seed + index * 2)}</p>
                <p style={{ margin: 0 }}>{paragraph(seed + index * 2 + 1)}</p>
            </section>
        ))}
    </div>
);

const Footer = ({ index, muted }: { index: number; muted: string }) => (
    <footer style={{ ...columnStyle, padding: '40px 24px 48px', fontFamily: fontUI, fontSize: 12, color: muted, letterSpacing: '0.12em' }}>
        SITE {String(index).padStart(2, '0')} · A PLURID PAGE
    </footer>
);


export const SitePage = ({ index, options = {} }: { index: number; options?: SiteOptions }) => {
    const accent = ACCENTS[(index - 1) % ACCENTS.length];
    const palette = PALETTES[options.theme ?? 'dark'];
    return (
        <div style={pageStyle(palette)} data-rt-site="page" data-rt-site-theme={options.theme ?? 'dark'}>
            <header style={headerStyle(accent, palette, !!options.stickyHeader)}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.16em' }}>SITE {String(index).padStart(2, '0')}</span>
                <nav style={{ display: 'flex', gap: 28 }}>
                    <PluridLink route={`/page-${index}/about`} style={navLinkStyle(accent)}>about</PluridLink>
                    <PluridLink route={`/page-${index}/contact`} style={navLinkStyle(accent)}>contact</PluridLink>
                </nav>
            </header>

            <div style={{ ...columnStyle, padding: '72px 24px 40px' }}>
                <p style={{ fontFamily: fontUI, fontSize: 13, letterSpacing: '0.18em', color: accent, margin: '0 0 18px' }}>A SITE FIRST</p>
                <h1 style={{ fontFamily: fontUI, fontSize: 44, lineHeight: 1.1, margin: '0 0 20px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    An ordinary page, until the space is one move away.
                </h1>
                <p style={{ fontSize: 20, color: palette.lead, margin: 0 }}>{SENTENCES[0]} {SENTENCES[1]}</p>
                <div style={{ height: 2, width: 64, background: accent, margin: '32px 0 0' }} />
            </div>

            <Prose sections={SECTIONS} seed={index} />
            <Footer index={index} muted={palette.muted} />
        </div>
    );
};


export const SubPage = ({ index, kind, options = {} }: { index: number; kind: 'about' | 'contact'; options?: SiteOptions }) => {
    const accent = ACCENTS[(index - 1) % ACCENTS.length];
    const palette = PALETTES[options.theme ?? 'dark'];
    const lens = usePluridPlane();
    return (
        <div style={pageStyle(palette)} data-rt-site={kind} data-rt-site-theme={options.theme ?? 'dark'}>
            <header style={headerStyle(accent, palette, !!options.stickyHeader)}>
                <button
                    type="button"
                    data-rt-site-back
                    onClick={() => lens.navigateToParent()}
                    style={{ ...navLinkStyle(accent), background: 'none', border: 0, borderBottom: `1px solid ${accent}66`, padding: '0 0 2px', font: 'inherit', fontFamily: fontUI, fontSize: 14 }}
                >
                    ← site {String(index).padStart(2, '0')}
                </button>
                <span style={{ fontSize: 13, letterSpacing: '0.16em', color: palette.muted }}>{kind.toUpperCase()}</span>
            </header>

            <div style={{ ...columnStyle, padding: '56px 24px 24px' }}>
                <h1 style={{ fontFamily: fontUI, fontSize: 36, margin: '0 0 16px', fontWeight: 700 }}>
                    {kind === 'about' ? 'About this site' : 'Contact'}
                </h1>
                <p style={{ fontSize: 19, color: palette.lead, margin: 0 }}>
                    {kind === 'about' ? SENTENCES[3] + ' ' + SENTENCES[6] : 'A short page: it fits the view, so there is nothing to scroll.'}
                </p>
            </div>

            {kind === 'about'
                ? (
                    <>
                        <div style={columnStyle}>
                            <p style={{ margin: 0 }}>
                                Questions? <PluridLink route={`/page-${index}/contact`} style={navLinkStyle(accent)}>write to us</PluridLink>.
                            </p>
                        </div>
                        <Prose sections={SECTIONS.slice(0, 8)} seed={index + 10} />
                    </>
                )
                : (
                    <div style={columnStyle}>
                        <p style={{ margin: '0 0 8px' }}>mail · hello@site-{String(index).padStart(2, '0')}.example</p>
                        <p style={{ margin: 0 }}>{SENTENCES[5]}</p>
                    </div>
                )}
            <Footer index={index} muted={palette.muted} />
        </div>
    );
};
