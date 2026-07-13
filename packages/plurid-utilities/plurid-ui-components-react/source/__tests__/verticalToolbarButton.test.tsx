// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';

    import themes from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import VerticalToolbarButton from '../components/pluridal/toolbars/VerticalToolbarButton';
    // #endregion internal
// #endregion imports



// #region module
describe('VerticalToolbarButton', () => {
    it('renders a named native button', () => {
        const html = renderToString(
            <VerticalToolbarButton
                atClick={() => {}}
                icon={() => <svg aria-hidden="true" />}
                active={false}
                text="add plane"
                textLeft={false}
                showText={false}
                scaleIcon={false}
                theme={themes.plurid}
            />,
        );

        expect(html).toContain('<button');
        expect(html).toContain('type="button"');
        expect(html).toContain('aria-label="add plane"');
    });
});
// #endregion module
