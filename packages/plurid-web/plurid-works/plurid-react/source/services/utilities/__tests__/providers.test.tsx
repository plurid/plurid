// #region imports
    // #region libraries
    import React from 'react';
    import {
        renderToStaticMarkup,
    } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import {
        composePluridProviders,
    } from '../providers';
    // #endregion external
// #endregion imports



// #region module
describe('composePluridProviders()', () => {
    it('nests layers[0] innermost and the last layer outermost, passing each layer its properties', () => {
        const Layer = ({ name, children }: React.PropsWithChildren<{ name: string }>) => (
            <div data-layer={name}>{children}</div>
        );
        const html = renderToStaticMarkup(composePluridProviders(
            [
                { name: 'inner', Provider: Layer, properties: { name: 'inner' } },
                { name: 'outer', Provider: Layer, properties: { name: 'outer' } },
            ],
            <span>app</span>,
        ));
        expect(html).toBe('<div data-layer="outer"><div data-layer="inner"><span>app</span></div></div>');
        expect(renderToStaticMarkup(composePluridProviders([], <span>bare</span>))).toBe('<span>bare</span>');
    });
});
// #endregion module
