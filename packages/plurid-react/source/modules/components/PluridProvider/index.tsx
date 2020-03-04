import React, {
    Component,
} from 'react';

import {
    runtime,
} from '@plurid/plurid-functions';



const defaultValue = {};
export const Context = React.createContext(defaultValue);


interface PluridProviderProperties {
    context: any;
}

export default class PluridProvider extends Component<PluridProviderProperties> {
    static canUseDOM = runtime.isBrowser;
    static displayName = 'PluridProvider';

    private instances: any[] = [];
    private value = {
        setPlurid: (serverState: any) => {
            this.props.context.plurid = serverState;
        },
        pluridInstances: {
            get: () => this.instances,
            add: (instance: any) => {
                this.instances.push(instance);
            },
            remove: (instance: any) => {
                const index = this.instances.indexOf(instance);
                this.instances.splice(index, 1);
            },
        },
    };

    constructor(
        props: any,
    ) {
        super(props);

        if (!PluridProvider.canUseDOM) {
            // props.context.helmet = mapStateOnServer({
            // });
        }
    }

    render() {
        return (
            <Context.Provider
                value={this.value}
            >
                {this.props.children}
            </Context.Provider>
        );
    }
}
