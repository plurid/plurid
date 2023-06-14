// #region imports
    // #region libraries
    import React, {
        // useContext,
        // useState,
        // useEffect,
        Component,
    } from 'react';

    import {
        Store,
        Unsubscribe as ReduxUnsubscribe,
    } from '@reduxjs/toolkit';

    import {
        Provider as ReduxProvider,
    } from 'react-redux';


    import {
        PluridApplication as PluridApplicationProperties,
        PluridState,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    // import PluridProviderContext from '~containers/Provider/context';

    import store from '~services/state/store';
    import StateContext from '~services/state/context';

    // import {
    //     loadStateFromContext,
    // } from '~services/logic/state';

    import {
        state,
        registerPlanes,
        PluridPlanesRegistrar,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import PluridView from './View';
    // #endregion internal
// #endregion imports



// #region module
// const FCPluridApplication: React.FC<PluridApplicationProperties<PluridReactComponent>> = (
//     properties,
// ) => {
//     // #region properties

//     // #endregion properties


//     // #region context
//     const context = useContext(PluridProviderContext);
//     // #endregion context


//     // #region state
//     const [planesRegistrar, setPlanesRegistrar] = useState<IPluridPlanesRegistrar<PluridReactComponent> | undefined>(
//         typeof window === 'undefined' && !properties.planesRegistrar
//             ? new PluridPlanesRegistrar(
//                 properties.planes,
//                 properties.hostname,
//             ) : properties.planesRegistrar
//     );
//     // #endregion state


//     // #region handlers
//     const computeStore = () => {
//         const {
//             // id,
//             view,
//             planes,
//             configuration,
//             precomputedState,
//             useLocalStorage,
//             hostname,
//             space,
//         } = properties;

//         registerPlanes(
//             planes,
//             planesRegistrar,
//             hostname,
//         );

//         const currentState = store
//             ? store.getState()
//             : undefined;

//         const localState = state.local.load(
//             storeID,
//             useLocalStorage,
//         );

//         const contextState = undefined;
//         // const contextState = loadStateFromContext(
//         //     this.context,
//         //     space,
//         // );
//         // console.log({
//         //     currentState,
//         //     localState,
//         //     precomputedState,
//         //     contextState,
//         // });

//         const _store = state.compute(
//             view,
//             configuration,
//             planesRegistrar,
//             currentState,
//             localState,
//             precomputedState,
//             contextState,
//             hostname,
//         );
//         // console.log({
//         //     store: store.space,
//         // });

//         return _store as any;
//     }
//     // #endregion handlers


//     // #region state
//     const [store, setStore] = useState<Store<PluridState>>(computeStore());
//     const [storeUnubscriber, setStoreUnubscriber] = useState<ReduxUnsubscribe | undefined>();
//     const [storeID, setStoreID] = useState<string>(properties.id || 'default');
//     // #endregion state


//     // #region effects
//     useEffect(() => {
//         if (!store) {
//             return;
//         }

//         if (typeof localStorage === 'undefined') {
//             return;
//         }

//         if (!properties.useLocalStorage) {
//             return;
//         }

//         const storeUnubscriber = store.subscribe(() => {
//             const state = store.getState();
//             const stateData = JSON.stringify(state);

//             localStorage.setItem(
//                 'pluridState-' + storeID,
//                 stateData,
//             );
//         });

//         return () => {
//             storeUnubscriber();
//         }
//     }, []);

//     useEffect(() => {
//         const updatedStore = computeStore();

//         store.dispatch({
//             type: 'SET_STATE',
//             payload: updatedStore,
//         });
//     }, []);
//     // #endregion effects


//     // #region render
//     return (
//         <ReduxProvider
//             store={store}
//             context={StateContext}
//         >
//             <PluridView
//                 {...properties}
//                 planesRegistrar={planesRegistrar}
//             />
//         </ReduxProvider>
//     );
//     // #endregion render
// }


class PluridApplication extends Component<
    PluridApplicationProperties<PluridReactComponent>
    // any,
    // any
> {
    // static contextType = PluridProviderContext;

    // public context!: React.ContextType<typeof PluridProviderContext>;

    private store: Store<PluridState>;
    private storeUnubscriber: ReduxUnsubscribe | undefined;
    private storeID: string;
    private planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined;


    constructor(
        properties: PluridApplicationProperties<PluridReactComponent>,
        // context: React.ContextType<typeof PluridProviderContext>,
    ) {
        super(properties);

        this.storeID = properties.id || 'default';
        // this.context = context;

        this.prepare();

        this.store = store(this.computeStore());
        this.subscribeStore();
    }


    public componentDidUpdate() {
        const updatedStore = this.computeStore();

        this.store.dispatch({
            type: 'SET_STATE',
            payload: updatedStore,
        });
    }

    public componentWillUnmount() {
        if (this.storeUnubscriber) {
            this.storeUnubscriber();
        }
    }

    public render() {
        return (
            <ReduxProvider
                store={this.store}
                context={StateContext}
            >
                <PluridView
                    {...this.props}
                    planesRegistrar={this.planesRegistrar}
                />
            </ReduxProvider>
        );
    }


    private prepare() {
        this.planesRegistrar = typeof window === 'undefined' && !this.props.planesRegistrar
            ? new PluridPlanesRegistrar(
                this.props.planes,
                this.props.hostname,
            ) : this.props.planesRegistrar;
    }

    private computeStore() {
        const {
            // id,
            view,
            planes,
            configuration,
            precomputedState,
            useLocalStorage,
            hostname,
            space,
        } = this.props;

        registerPlanes(
            planes,
            this.planesRegistrar,
            hostname,
        );

        const currentState = this.store
            ? this.store.getState()
            : undefined;

        const localState = state.local.load(
            this.storeID,
            useLocalStorage,
        );

        const contextState = undefined;
        // const contextState = loadStateFromContext(
        //     this.context,
        //     space,
        // );
        // console.log({
        //     currentState,
        //     localState,
        //     precomputedState,
        //     contextState,
        // });

        const store = state.compute(
            view,
            configuration,
            this.planesRegistrar,
            currentState,
            localState,
            precomputedState,
            contextState,
            hostname,
        );
        // console.log({
        //     store: store.space,
        // });

        return store;
    }

    private subscribeStore() {
        if (!this.store) {
            return;
        }

        if (typeof localStorage === 'undefined') {
            return;
        }

        if (!this.props.useLocalStorage) {
            return;
        }

        this.storeUnubscriber = this.store.subscribe(() => {
            const state = this.store.getState();
            const stateData = JSON.stringify(state);

            localStorage.setItem(
                'pluridState-' + this.storeID,
                stateData,
            );
        });
    }
}
// #endregion module



// #region exports
export default PluridApplication;
// #endregion exports
