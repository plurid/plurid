// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';

    import {
        PluridMetastate,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import PluridProviderContext from './context';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridProviderProperties {
    metastate: PluridMetastate | undefined;
}

class PluridProvider extends Component<
    React.PropsWithChildren<PluridProviderProperties>
> {
    static displayName = 'PluridProvider';

    private properties: React.PropsWithChildren<PluridProviderProperties>;

    constructor(
        properties: React.PropsWithChildren<PluridProviderProperties>,
    ) {
        super(properties);
        this.properties = properties;
    }

    render() {
        const {
            metastate,
            children,
        } = this.properties;

        return (
            <PluridProviderContext.Provider
                value={metastate}
            >
                {children}
            </PluridProviderContext.Provider>
        );
    }
}
// #endregion module



// #region exports
export default PluridProvider;
// #endregion exports
