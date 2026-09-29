// #region imports
    // #region libraries
    import React, {
        useRef,
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
    /** what the arrow does, for a screen reader (default `transform <direction>`) */
    label?: string;
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
        label,
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

    // a press that outlives its arrow (the toolbar closed under the pointer) stops with it: the
    // interval used to keep turning the space every 40 ms with nothing left to release it
    useEffect(() => () => {
        if (pressingInterval.current) {
            clearInterval(pressingInterval.current);
            pressingInterval.current = null;
        }
    }, []);
    // #endregion handlers


    /** render */
    return (
        <StyledPluridTransformArrow
            type="button"
            aria-label={label || 'transform ' + direction}
            data-plurid-control="transform-arrow"
            data-plurid-direction={direction}
            theme={interactionTheme}
            pressed={pressed}
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onPointerCancel={endPress}
            // the keyboard's press (Enter, Space): one step. A pointer's click follows its own
            // pointerdown, which already stepped (`detail` counts the pointer's clicks, 0 for a key)
            onClick={(event) => {
                if (event.detail === 0) {
                    transform({ altKey: event.altKey });
                }
            }}
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
