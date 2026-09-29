// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
        useContext,
    } from 'react';
    // #endregion libraries


    // #region external
    import PluridProviderContext from '~containers/Provider/context';
    // #endregion external


    // #region internal
    import {
        StyledFadeIn,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface FadeInProperties {
    time: number;
}

const FadeIn: React.FC<FadeInProperties> = (
    properties,
) => {
    // #region properties
    const {
        time,
    } = properties;

    // A server-rendered page is its own first paint: covered until the script ran, every one painted
    // black (2026-09-29). The metastate is the server's, and the kit's client hydrates under the same
    // one, so neither side renders the cover.
    const serverRendered = useContext(PluridProviderContext) !== undefined;
    // #endregion properties


    // #region state
    const [
        fadedIn,
        setFadedIn,
    ] = useState(false);
    // #endregion state


    // #region effects
    useEffect(() => {
        if (time > 0) {
            setTimeout(() => {
                setFadedIn(true);
            }, time);
        }
    }, []);
    // #endregion effects


    // #region render
    if (fadedIn || time === 0 || serverRendered) {
        return (<></>);
    }

    return (
        <StyledFadeIn
            data-plurid-cover=""
        />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default FadeIn;
// #endregion exports
