// #region imports
    // #region libraries
    import {
        useState,
        useEffect,
    } from 'react';

    import {
        storage,
    } from '@plurid/plurid-functions';

    import {
        PLURID_ROUTER_LOCATION_STORED,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export const usePluridRouter = () => {
    // #region state
    const [
        routerValue,
        setRouterValue,
    ] = useState('');
    // #endregion state


    // #region effects
    useEffect(() => {
        const fetchState = () => {
            const state = storage.loadState('__PLURID_ROUTER__');
            if (state) {
                setRouterValue(state);
            }
        }
        fetchState();

        window.addEventListener(PLURID_ROUTER_LOCATION_STORED, fetchState);

        return () => {
            window.removeEventListener(PLURID_ROUTER_LOCATION_STORED, fetchState);
        }
    }, []);
    // #endregion effects


    return routerValue;
}
// #endregion module
