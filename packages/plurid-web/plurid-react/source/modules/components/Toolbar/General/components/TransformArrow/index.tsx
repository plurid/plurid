import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPluridTransformArrow,
} from './styled';

import {
    loadHammer,
} from '../../../../../services/utilities/imports';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



export interface PluridTransformArrowOwnProperties {
    direction: string;
    transform: () => void;
}

export interface PluridTransformArrowStateProperties {
    interactionTheme: Theme;
}

export interface PluridTransformArrowDispatchProperties {
}

export type PluridTransformArrowProperties = PluridTransformArrowOwnProperties
    & PluridTransformArrowStateProperties
    & PluridTransformArrowDispatchProperties;


const PluridTransformArrow: React.FC<PluridTransformArrowProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        direction,
        transform,

        /** state */
        interactionTheme,

        /** dispatch */
    } = properties;


    /** references */
    const pressingInterval = useRef(0);
    const arrowElement = useRef<null | number>(null);


    /** state */
    const [arrowSign, setArrowSign] = useState('');
    const [pressed, setPressed] = useState(false);


    /** handlers */
    const handleTouch = (
        event: HammerInput,
    ) => {
        switch (event.type) {
            case 'tap':
                transform();
                if (pressingInterval.current) {
                    setPressed(false);
                    clearInterval(pressingInterval.current);
                }
                break;
            case 'press':
                setPressed(true);
                pressingInterval.current = setInterval(() => {
                    transform();
                }, 30);
                break;
            case 'pressup':
                setPressed(false);
                clearInterval(pressingInterval.current);
                break;
        }
    }


    /** effects */
    /** Direction */
    useEffect(() => {
        switch (direction) {
            case 'left':
                setArrowSign('◀');
                break;
            case 'right':
                setArrowSign('▶');
                break;
            case 'up':
                setArrowSign('▲');
                break;
            case 'down':
                setArrowSign('▼');
                break;
        }
    }, [
        direction,
    ]);

    /** Touch */
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let touch: HammerManager;

        const handleTouch = async () => {
            const HammerImport = await loadHammer();
            const Hammer = HammerImport.default;

            touch = new Hammer((arrowElement as any).current);
            touch.on('tap press pressup', handleTouch);
        }

        handleTouch();

        return () => {
            if (touch) {
                touch.off('tap press pressup', handleTouch);
            }
        }
    }, [
        arrowElement.current,
    ]);


    /** render */
    return (
        <StyledPluridTransformArrow
            ref={arrowElement}
            theme={interactionTheme}
            pressed={pressed}
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


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridTransformArrow);
