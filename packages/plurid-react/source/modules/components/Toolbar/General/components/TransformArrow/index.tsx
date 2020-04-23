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
    StyledTransformArrow,
} from './styled';

import {
    loadHammer,
} from '../../../../../services/utilities/imports';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



interface TransformArrowOwnProperties {
    direction: string;
    transform: () => void;
}

interface TransformArrowStateProperties {
    interactionTheme: Theme;
}

interface TransformArrowDispatchProperties {
}

type TransformArrowProperties = TransformArrowOwnProperties
    & TransformArrowStateProperties
    & TransformArrowDispatchProperties;


const TransformArrow: React.FC<TransformArrowProperties> = (
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
        <StyledTransformArrow
            ref={arrowElement}
            theme={interactionTheme}
            pressed={pressed}
        >
            {arrowSign}
        </StyledTransformArrow>
    );
}


const mapStateToProps = (
    state: AppState,
): TransformArrowStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): TransformArrowDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(TransformArrow);
