// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';
    // #endregion libraries


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
    if (fadedIn || time === 0) {
        return (<></>);
    }

    return (
        <StyledFadeIn />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default FadeIn;
// #endregion exports
