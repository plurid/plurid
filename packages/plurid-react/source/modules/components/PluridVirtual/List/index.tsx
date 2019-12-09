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
    sumTo,
} from '../../../services/utilities/math';

import PluridVirtualListItem from './components/ListItem';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
// import actions from '../../../services/state/actions';
import {
    ViewSize,
} from '../../../services/state/modules/data/types';



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

const PluridVirtualList: React.FC<PluridVirtualListProperties> = (properties) => {
    const {
        /** own */
        items,
        generalHeight,

        /** state */
        translationY,
        viewSize,
    } = properties;

    const _generalHeight = generalHeight || 100;

    const listElement = useRef<HTMLDivElement>(null);

    const rows = useRef<any[]>([]);
    const heights = useRef<number[]>(Array(items.length).fill(0));

    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(Math.floor(2000 / _generalHeight));
    const [elementHeight, setElementHeight] = useState(10000);

    const [resizing, setResizing] = useState(false);

    const setHeight = (
        value: number,
        index: number,
    ) => {
        console.log('set height for', value, index);
        heights.current[index] = value;
    }

    const renderRows = () => {
        rows.current = [];
        console.log('RENDERED', start, end);

        for (let i = start; i <= end; i++) {
            let item = items[i];
            rows.current.push(
                <PluridVirtualListItem
                    key={i + Math.random()}
                    index={i}
                    top={sumTo(heights.current, i)}
                    element={item}
                    setHeight={setHeight}
                />
            );
        }
        return rows.current;
    }

    useEffect(() => {
        if (heights.current) {
            const elementHeight = sumTo(heights.current, heights.current.length);
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
            if (sum < Math.abs(translationY)) {
                setStart(index);
            }

            if (
                sum > Math.abs(translationY) + viewSize.height
                && sum < Math.abs(translationY) + viewSize.height + 400
            ) {
                setEnd(index);
            }
        }
    }, [
        viewSize.height,
        translationY,
    ]);

    useEffect(() => {
        setResizing(true);

        setTimeout(() => {
            // const elementHeight = sumTo(heights.current, heights.current.length);
            // setElementHeight(elementHeight);

            setResizing(false);
        }, 400);
    }, [
        viewSize,
    ]);

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
    viewSize: selectors.data.getViewSize(state),
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
