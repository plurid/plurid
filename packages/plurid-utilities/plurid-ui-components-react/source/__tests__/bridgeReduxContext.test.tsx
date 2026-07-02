// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';

    import {
        Provider,
        connect,
    } from 'react-redux';

    import {
        configureStore,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import {
        bridgeReduxContext,
    } from '../utilities/redux';
    // #endregion internal
// #endregion imports



// #region module
/**
 * react-redux 9 + React 19 resolve a `context` PROP on a connected component
 * to the DEFAULT context in the production build - SSR then throws
 * `Cannot read properties of null (reading 'store')`. The bridge re-publishes
 * the custom context's value on the default context so the prop mechanism is
 * never relied on. (The production-flavor proof requires NODE_ENV=production
 * at react-redux require time - impossible under jest's module registry -
 * so this pins the WIRING; the repro/proof script lives in the fix commit.)
 */
describe('bridgeReduxContext', () => {
    const makeStore = (value: string) => configureStore({
        reducer: {
            head: () => ({ title: value }),
        },
    });

    const Inner: React.FC<any> = (properties) => (
        <div>{properties.title}</div>
    );

    const Connected = connect(
        (state: any) => ({ title: state.head.title }),
    )(Inner);

    const Bridged = bridgeReduxContext(Connected, 'Inner');

    it('renders through a CUSTOM context passed as a prop', () => {
        const CustomContext = React.createContext<any>(null);
        const html = renderToString(
            <Provider
                store={makeStore('through-custom')}
                context={CustomContext}
            >
                <Bridged
                    context={CustomContext}
                />
            </Provider>,
        );

        expect(html).toContain('through-custom');
    });

    it('renders through the DEFAULT context when no context prop is given', () => {
        const html = renderToString(
            <Provider
                store={makeStore('through-default')}
            >
                <Bridged />
            </Provider>,
        );

        expect(html).toContain('through-default');
    });
});
// #endregion module
