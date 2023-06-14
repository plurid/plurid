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
    import {
        loadHammer,
    } from '~services/utilities/imports';

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
        events,
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
    const pressingInterval = useRef<null | NodeJS.Timeout>(null);
    const arrowElement = useRef<null | HTMLDivElement>(null);
    // #endregion references


    // #region state
    const [
        pressed,
        setPressed,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const handleTouch = (
        event: HammerInput,
    ) => {
        const eventData = {
            altKey: event.srcEvent.altKey,
        };

        switch (event.type) {
            case 'tap':
                transform(eventData);
                if (pressingInterval.current) {
                    setPressed(false);
                    clearInterval(pressingInterval.current);
                }
                break;
            case 'press':
                setPressed(true);
                pressingInterval.current = setInterval(() => {
                    transform(eventData);
                }, 30);
                break;
            case 'pressup':
                setPressed(false);
                if (pressingInterval.current) {
                    clearInterval(pressingInterval.current);
                }
                break;
        }
    }

    const handleMouseLeave = () => {
        if (pressingInterval.current) {
            setPressed(false);
            clearInterval(pressingInterval.current);
        }
    }
    // #endregion handlers


    // #region effects
    /** Touch */
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let touch: HammerManager;

        const loadTouch = async () => {
            const HammerImport = await loadHammer();
            const Hammer = HammerImport.default;

            touch = new Hammer((arrowElement as any).current);
            touch.on(events, handleTouch);
        }
        loadTouch();

        return () => {
            if (touch) {
                touch.off(events, handleTouch);
            }
        }
    }, [
        arrowElement.current,
    ]);
    // #endregion effects


    /** render */
    return (
        <StyledPluridTransformArrow
            ref={arrowElement}
            theme={interactionTheme}
            pressed={pressed}
            onMouseLeave={() => handleMouseLeave()}
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
