import React, {
    useRef,
    useEffect,
    useState,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridSpinner,
} from '@plurid/plurid-ui-react';

import {
    mathematics,
} from '@plurid/plurid-functions';

import PluridVirtualListItem from './components/ListItem';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
// import actions from '../../../services/state/actions';
import {
    ViewSize,
} from '../../../services/state/types/space';



interface PluridVirtualListOwnProperties {
    items: JSX.Element[];
    generalHeight?: number;
}

interface PluridVirtualListStateProperties {
    translationY: number,
    viewSize: ViewSize;
}

interface PluridVirtualListDispatchProperties {
}

type PluridVirtualListProperties = PluridVirtualListOwnProperties
    & PluridVirtualListStateProperties
    & PluridVirtualListDispatchProperties;


const PluridVirtualList: React.FC<PluridVirtualListProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        items,
        generalHeight,

        /** state */
        translationY,
        viewSize,
    } = properties;

    const _generalHeight = generalHeight || 100;


    /** references */
    const listElement = useRef<HTMLDivElement>(null);

    const rows = useRef<any[]>([]);
    const heights = useRef<number[]>(Array(items.length).fill(_generalHeight));


    /** state */
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(Math.floor(1000 / _generalHeight));
    const [elementHeight, setElementHeight] = useState(_generalHeight * (end - start));

    const [resizing, setResizing] = useState(false);


    /** handlers */
    const setHeight = (
        value: number,
        index: number,
    ) => {
        heights.current[index] = value;
    }

    const renderRows = () => {
        rows.current = [];

        for (let i = start; i <= end; i++) {
            let item = items[i];
            rows.current.push(
                <PluridVirtualListItem
                    key={i + Math.random()}
                    index={i}
                    top={mathematics.arithmetic.sum(heights.current, i)}
                    element={item}
                    setHeight={setHeight}
                />
            );
        }
        return rows.current;
    }


    /** effects */
    useEffect(() => {
        if (heights.current) {
            const elementHeight = mathematics.arithmetic.sum(heights.current, heights.current.length);
            setElementHeight(elementHeight);
        }
    }, [
        start,
        end,
        heights.current,
    ]);

    useEffect(() => {
        let sum = 0;
        for (let [index, value] of heights.current.entries()) {
            sum += value;
            if (translationY < 0) {
                if (sum < Math.abs(translationY)) {
                    setStart(index);
                }

                if (
                    sum > Math.abs(translationY) + viewSize.height
                    && sum < Math.abs(translationY) + viewSize.height + 400
                ) {
                    setEnd(index);
                }
            } else {
                setStart(0);
                setEnd(10);
            }
        }
    }, [
        viewSize.height,
        translationY,
    ]);

    useEffect(() => {
        setResizing(true);

        setTimeout(() => {
            const elementHeight = mathematics.arithmetic.sum(heights.current, heights.current.length);
            setElementHeight(elementHeight);

            setResizing(false);
        }, 400);
    }, [
        viewSize,
    ]);


    /** render */
    return (
        <div
            style={{
                height: elementHeight,
            }}
            ref={listElement}
        >
            {resizing && (
                <>
                    <PluridSpinner
                    />
                </>
            )}
            {!resizing && (
                <>
                    {renderRows()}
                </>
            )}
        </div>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridVirtualListStateProperties => ({
    translationY: selectors.space.getTranslationY(state),
    viewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridVirtualListDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridVirtualList);
