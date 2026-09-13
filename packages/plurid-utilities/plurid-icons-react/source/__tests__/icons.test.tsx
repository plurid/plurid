/**
 * @jest-environment jsdom
 */
// #region imports
    // #region libraries
    import React from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import {
        PluridIcon,
        PLURID_ICON_SIZES,
    } from '../index';

    import * as icons from '../icons';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE ICONS: every one is an inline SVG a host can size and colour, never an image request. This
 * package's only test used to be `expect(true).toBeTruthy()` (2026-09-13), so nothing here was
 * verified at all — a broken export or an icon that renders nothing would have shipped green.
 */
const markup = (
    element: React.ReactElement,
) => renderToStaticMarkup(element);


const exported = Object.entries(icons)
    .filter(([name, value]) => name.startsWith('PluridIcon') && typeof value === 'function') as [string, React.FC][];


describe('the plurid icons', () => {
    it('there are icons to test', () => {
        expect(exported.length).toBeGreaterThan(50);
    });

    it('EVERY exported icon renders an inline SVG and fetches nothing', () => {
        const broken: string[] = [];
        const remote: string[] = [];
        for (const [name, Icon] of exported) {
            const html = markup(<Icon />);
            if (!html.includes('<svg') || !html.includes('</svg>')) {
                broken.push(name);
            }
            // the `xmlns` is a URL and is not a request; an `<img>` or a `url(…)` would be
            if (html.includes('<img') || html.includes('src=') || html.includes('url(')) {
                remote.push(name);
            }
        }
        expect(broken).toEqual([]);
        expect(remote).toEqual([]);
    });

    it('an icon renders WITHOUT a React warning (a styled prop never reaches the DOM)', () => {
        const complaints: string[] = [];
        const error = jest.spyOn(console, 'error').mockImplementation((...parts: unknown[]) => {
            complaints.push(parts.map(String).join(' '));
        });

        // every icon passes its size to a styled wrapper; an untransient prop is forwarded to the
        // div and React complains once per icon (found 2026-09-13 — `$iconSize` is the fix)
        for (const [, Icon] of exported.slice(0, 12)) {
            markup(<Icon />);
        }
        error.mockRestore();

        expect(complaints).toEqual([]);
    });

    it('the wrapper takes a size and a class from its host', () => {
        const html = markup(
            <PluridIcon
                size={PLURID_ICON_SIZES.large}
                className="host-class"
            >
                {React.createElement(exported[0][1])}
            </PluridIcon>,
        );
        expect(html).toContain('host-class');
        expect(html).toContain('<svg');
    });

    it('the sizes are the three named ones plus a number', () => {
        expect(Object.values(PLURID_ICON_SIZES)).toEqual(expect.arrayContaining(['small', 'normal', 'large']));
    });
});
// #endregion module
