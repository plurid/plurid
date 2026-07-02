// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';

    import {
        ServerStyleSheet,
    } from 'styled-components';
    // #endregion libraries


    // #region internal
    import {
        styled,
        pluridShouldForwardProp,
    } from '../utilities/styled';

    import LinkButton from '../components/universal/buttons/LinkButton';
    import Textline from '../components/universal/inputs/Textline';
    // #endregion internal
// #endregion imports



// #region module
const renderWithStyles = (
    element: React.ReactElement,
) => {
    const sheet = new ServerStyleSheet();
    try {
        return renderToString(
            sheet.collectStyles(element),
        );
    } finally {
        sheet.seal();
    }
};


describe('pluridShouldForwardProp', () => {
    it('blocks custom style props on host elements', () => {
        expect(pluridShouldForwardProp('level', 'div')).toBe(false);
        expect(pluridShouldForwardProp('isDisabled', 'button')).toBe(false);
        expect(pluridShouldForwardProp('inline', 'div')).toBe(false);
        expect(pluridShouldForwardProp('devisible', 'div')).toBe(false);
    });

    it('blocks the style-only names that are valid HTML attributes', () => {
        expect(pluridShouldForwardProp('size', 'button')).toBe(false);
        expect(pluridShouldForwardProp('selected', 'div')).toBe(false);
    });

    it('forwards valid HTML attributes on host elements', () => {
        expect(pluridShouldForwardProp('href', 'a')).toBe(true);
        expect(pluridShouldForwardProp('type', 'button')).toBe(true);
        expect(pluridShouldForwardProp('data-plurid', 'div')).toBe(true);
        expect(pluridShouldForwardProp('aria-label', 'div')).toBe(true);
    });

    it('forwards everything to composed component targets', () => {
        const Component = () => null;
        expect(pluridShouldForwardProp('level', Component)).toBe(true);
        expect(pluridShouldForwardProp('isDisabled', Component)).toBe(true);
    });
});


describe('filtered styled factory', () => {
    it('filters custom props from the DOM but keeps the styling', () => {
        interface TestProps {
            level: number;
            isDisabled: boolean;
        }
        const StyledTest = styled.div<TestProps>`
            opacity: ${({ isDisabled }) => isDisabled ? 0.5 : 1};
        `;

        const html = renderWithStyles(
            <StyledTest
                level={2}
                isDisabled={true}
                data-plurid="kept"
            />,
        );

        expect(html).toMatch(/<div/);
        expect(html).toMatch(/class="/);
        expect(html).toMatch(/data-plurid="kept"/);
        expect(html).not.toMatch(/level=/i);
        expect(html).not.toMatch(/isdisabled=/i);
    });

    it('supports the styled(Component) composition without filtering', () => {
        const Inner: React.FC<any> = (properties) => (
            <span data-received={String(properties.level)}>
                {properties.children}
            </span>
        );
        const StyledInner = styled(Inner)`
            color: red;
        `;

        const html = renderWithStyles(
            <StyledInner level={3} />,
        );

        expect(html).toMatch(/data-received="3"/);
    });
});


describe('library components no longer leak custom props', () => {
    it('LinkButton: level/inline/active/disabled stay off the DOM', () => {
        const html = renderWithStyles(
            <LinkButton
                text="press"
                atClick={() => {}}
                level={2}
                inline={true}
                active={true}
                disabled={true}
            />,
        );

        expect(html).toMatch(/press/);
        expect(html).not.toMatch(/level=/i);
        expect(html).not.toMatch(/inline=/i);
        expect(html).not.toMatch(/active=/i);
        // the native `disabled` attribute is legitimate on <button>
    });

    it('Textline: devisible/round/center/level stay off the DOM', () => {
        const html = renderWithStyles(
            <Textline
                text="value"
                atChange={() => {}}
                level={1}
                devisible={true}
                round={true}
                center={true}
            />,
        );

        expect(html).toMatch(/<input/);
        expect(html).not.toMatch(/devisible=/i);
        expect(html).not.toMatch(/round=/i);
        expect(html).not.toMatch(/center=/i);
        expect(html).not.toMatch(/level=/i);
    });
});
// #endregion module
