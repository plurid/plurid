// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
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
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridTransformArrow,
    } from './styled';

    import {
        arrowSigns,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridTransformArrowOwnProperties {
    direction: string;
    transform: (
        event: {
            altKey: boolean;
        },
    ) => void;
}

export interface PluridTransformArrowStateProperties {
    interactionTheme: Theme;
}

export interface PluridTransformArrowDispatchProperties {
}

export type PluridTransformArrowProperties =
    & PluridTransformArrowOwnProperties
    & PluridTransformArrowStateProperties
    & PluridTransformArrowDispatchProperties;


const PluridTransformArrow: React.FC<PluridTransformArrowProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        direction,
        transform,
        // #endregion own

        // #region state
        interactionTheme,
        // #endregion state
    } = properties;

    const arrowSign = (arrowSigns as any)[direction] || '';
    // #endregion properties


    // #region references
    const pressingInterval = useRef<null | ReturnType<typeof setTimeout>>(null);
    // #endregion references


    // #region state
    const [
        pressed,
        setPressed,
    ] = useState(false);
    // #endregion state


    // #region handlers
    // Press-and-hold via native Pointer Events (replaces HammerJS tap/press): a click
    // fires one transform; holding repeats it until release or pointer-leave.
    const startPress = (
        event: React.PointerEvent,
    ) => {
        const eventData = {
            altKey: event.altKey,
        };

        transform(eventData);
        setPressed(true);

        if (pressingInterval.current) {
            clearInterval(pressingInterval.current);
        }
        pressingInterval.current = setInterval(() => {
            transform(eventData);
        }, 40);
    }

    const endPress = () => {
        setPressed(false);
        if (pressingInterval.current) {
            clearInterval(pressingInterval.current);
            pressingInterval.current = null;
        }
    }
    // #endregion handlers


    /** render */
    return (
        <StyledPluridTransformArrow
            theme={interactionTheme}
            pressed={pressed}
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onPointerCancel={endPress}
        >
            {arrowSign}
        </StyledPluridTransformArrow>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridTransformArrowStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridTransformArrowDispatchProperties => ({
});


const ConnectedPluridTransformArrow = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridTransformArrow);
// #endregion module



// #region exports
export default ConnectedPluridTransformArrow;
// #endregion exports
