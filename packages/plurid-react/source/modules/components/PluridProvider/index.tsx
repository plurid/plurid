import React, {
    Component,
} from 'react';

import {
    PluridMetastate,
} from '@plurid/plurid-data';

import PluridProviderContext from './context';



interface PluridProviderProperties {
    metastate: PluridMetastate;
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


export default PluridProvider;
