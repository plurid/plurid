// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        ToolbarButton,
    } from '~data/interfaces';

    import {
        HorizontalPositions,
    } from '~data/enumerations';

    import VerticalToolbarButton from '../VerticalToolbarButton';
    // #endregion external


    // #region internal
    import {
        StyledToolbar,
        StyledToolbarButtons,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface ToolbarSpecificOwnProperties {
    buttons: ToolbarButton[],
    handleClick: (
        type: any,
        index: number,
    ) => void;
    activeType: any;
    selectors: any;
    position?: keyof typeof HorizontalPositions;

    children?: React.ReactNode;
}

export interface ToolbarSpecificStateProperties {
    stateToolbars: any;
    stateIdentonym: string;
    stateInteractionTheme: Theme;
}

export interface ToolbarSpecificDispatchProperties {
}

export type ToolbarSpecificProperties = ToolbarSpecificOwnProperties
    & ToolbarSpecificStateProperties
    & ToolbarSpecificDispatchProperties;

const ToolbarSpecific: React.FC<ToolbarSpecificProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** own */
        buttons,
        handleClick,
        activeType,
        position,

        children,

        // #region state
        stateToolbars,
        stateIdentonym,
        stateInteractionTheme,
        // #endregion state
    } = properties;

    const {
        alwaysShow,
        location,
        scaleIcons,
        showNames,
    } = stateToolbars;

    const toolbarPosition = position
        ? position
        : HorizontalPositions.right;
    // #endregion properties


    // #region state
    const [showToolbar, setShowToolbar] = useState(alwaysShow);
    const [mouseIn, setMouseIn] = useState(false);
    // #endregion state


    // #region handlers
    const handleMouseMove = (
        event: any,
    ) => {
        if (!showToolbar) {
            setShowToolbar(true);
        }

        // TODO
        // move toolbar
        // if (event.shiftKey) {
        // }
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        if (alwaysShow) {
            setShowToolbar(true);
        }

        if (mouseIn) {
            setShowToolbar(true);
        } else {
            if (!alwaysShow) {
                setShowToolbar(false);
            }
        }
    }, [
        mouseIn,
        alwaysShow,
    ]);
    // #endregion effects


    // #region render
    return (
        <StyledToolbar
            onMouseMove={() => handleMouseMove}
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
            position={toolbarPosition}
        >
            <StyledToolbarButtons
                theme={stateInteractionTheme}
                style = {{
                    top: location ? location + '%' : '',
                    opacity: showToolbar ? 1 : 0
                }}
            >
                {buttons.filter(button => {
                    const {
                        loggedIn,
                    } = button;

                    if (loggedIn === 'ONLY' && !stateIdentonym) {
                        return false;
                    }

                    if (loggedIn === 'NONE' && stateIdentonym) {
                        return false;
                    }

                    return true;
                }).map((
                    button: ToolbarButton,
                    index,
                ) => {
                    const {
                        type,
                        text,
                        icon: Icon,
                        first,
                        last,
                    } = button;

                    return (
                        <VerticalToolbarButton
                            key={type}
                            atClick={() => handleClick(type, index)}
                            icon={Icon}
                            active={activeType === type}
                            text={text}
                            textLeft={toolbarPosition === 'right'}
                            showText={showNames}
                            scaleIcon={scaleIcons}
                            theme={stateInteractionTheme}
                            first={first}
                            last={last}
                        />
                    );
                })}

                {children}
            </StyledToolbarButtons>
        </StyledToolbar>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: any,
    ownProperties: any,
): ToolbarSpecificStateProperties => ({
    stateToolbars: ownProperties.selectors.product.getProductUI(state).toolbars,
    stateIdentonym: ownProperties.selectors.owner.getIdentonym(state),
    stateInteractionTheme: ownProperties.selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarSpecificDispatchProperties => ({
});


const ConnectedToolbarSpecific = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(ToolbarSpecific);
// #endregion module



// #region exports
export default ConnectedToolbarSpecific;
// #endregion exports
