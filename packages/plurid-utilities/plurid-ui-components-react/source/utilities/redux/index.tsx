// #region imports
    // #region libraries
    import React from 'react';

    import {
        ReactReduxContext,
    } from 'react-redux';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * react-redux 9 + React 19: passing `context` as a PROP to a `connect`ed
 * component resolves to the DEFAULT context in the production build (the
 * prop-context validity check rejects the prop there, development accepts
 * it) - server-side rendering then reads a `null` default-context value and
 * throws `Cannot read properties of null (reading 'store')`.
 *
 * Bridge instead of trusting the prop mechanism: read the custom context's
 * VALUE (the react-redux `{ store, subscription }` published by the app's
 * `Provider context={...}`) and re-publish it on react-redux's default
 * context around the connected component, which stays default-context
 * `connect`ed. Uses only public react-redux exports and behaves identically
 * in development, production, server, and client.
 *
 * Without a `context` prop the bridge re-publishes the default context's
 * own value - a no-op, fully backwards compatible.
 */
export type BridgedReduxProperties<P> = P & {
    context?: React.Context<any>;
};

/**
 * The bridged component keeps the connected component's OWN props (`P`, inferred from the
 * `connect`ed component, so `selectors` and the rest stay typed) plus the optional `context`.
 */
export function bridgeReduxContext<P extends object>(
    Connected: React.ComponentType<P>,
    displayName?: string,
): React.FC<BridgedReduxProperties<P>> {
    const Bridged: React.FC<BridgedReduxProperties<P>> = (properties) => {
        const {
            context,
            ...rest
        } = properties;

        const value = React.useContext(context ?? ReactReduxContext);

        return (
            <ReactReduxContext.Provider
                value={value}
            >
                <Connected
                    {...(rest as unknown as P)}
                />
            </ReactReduxContext.Provider>
        );
    };
    Bridged.displayName = displayName || `BridgedRedux(${Connected.displayName || Connected.name || 'Component'})`;

    return Bridged;
}
// #endregion module
