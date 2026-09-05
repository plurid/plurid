// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';

    import {
        PluridMetastate,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridDocumentRegistry,
    } from '~services/document/registry';

    import {
        PluridDocumentScope,
    } from '~components/utilities/Document';
    // #endregion external


    // #region internal
    import PluridProviderContext from './context';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridProviderProperties {
    metastate: PluridMetastate | undefined;
    /**
     * The document registry to collect the head into — the server's per-request one. On the client
     * the provider owns a registry and renders the document head itself.
     */
    documentRegistry?: PluridDocumentRegistry;
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
            documentRegistry,
            children,
        } = this.props;

        return (
            <PluridDocumentScope
                registry={documentRegistry}
            >
                <PluridProviderContext.Provider
                    value={metastate}
                >
                    {children}
                </PluridProviderContext.Provider>
            </PluridDocumentScope>
        );
    }
}
// #endregion module



// #region exports
export default PluridProvider;
// #endregion exports
