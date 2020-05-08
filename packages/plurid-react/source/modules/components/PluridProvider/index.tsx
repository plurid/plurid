import React, {
    Component,
} from 'react';

import {
    runtime,
} from '@plurid/plurid-functions';



const defaultValue = {};
export const Context = React.createContext(defaultValue);


// interface PluridProviderContext {
// }

interface PluridProviderProperties<T> {
    context: T;
}

class PluridProvider<T> extends Component<
    React.PropsWithChildren<
        PluridProviderProperties<T>
    >
> {
    static displayName = 'PluridProvider';
    static canUseDOM = runtime.isBrowser;

    private properties: React.PropsWithChildren<PluridProviderProperties<T>>;
    private value = {};

    constructor(
        properties: React.PropsWithChildren<PluridProviderProperties<T>>,
    ) {
        super(properties);
        this.properties = properties;

        // if (!PluridProvider.canUseDOM) {
        // }
    }

    render() {
        const {
            context,
        } = this.properties;

        console.log('context', context);

        return (
            <Context.Provider
                value={this.value}
            >
                {this.properties.children}
            </Context.Provider>
        );
    }
}


export default PluridProvider;
