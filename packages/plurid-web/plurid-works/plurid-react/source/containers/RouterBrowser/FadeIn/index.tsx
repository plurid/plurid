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
}

const FadeIn: React.FC<FadeInProperties> = (
    properties,
) => {
    // #region state
    const [
        fadedIn,
        setFadedIn,
    ] = useState(false);
    // #endregion state


    // #region effects
    useEffect(() => {
        setTimeout(() => {
            setFadedIn(true);
        }, 10);
    }, []);
    // #endregion effects


    // #region render
    if (fadedIn) {
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
