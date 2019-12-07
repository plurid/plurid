import React, {
    useRef,
    useEffect,
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    sumTo,
} from '../../../services/utilities/math';

import PluridVirtualListItem from './components/ListItem';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
// import actions from '../../../services/state/actions';



interface PluridVirtualListOwnProperties {
    items: JSX.Element[];
    generalHeight?: number;
}

interface PluridVirtualListStateProperties {
    translationY: number,
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
    } = properties;

    const _generalHeight = generalHeight || 100;

    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(Math.floor(2000 / _generalHeight));

    const [elementHeight, setElementHeight] = useState(0);

    const rows = useRef<any[]>([]);
    const heights = useRef<number[]>(Array(end - start).fill(0));

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
            setElementHeight(elementHeight)
        }
    }, [
        heights.current,
    ]);

    useEffect(() => {
        console.log('translated on y');
    }, [
        translationY,
    ]);

    // console.log(rows.current);
    // console.log(heights.current);

    return (
        <div
            style={{
                height: elementHeight,
            }}
        >
            {renderRows()}
        </div>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridVirtualListStateProperties => ({
    translationY: selectors.space.getTranslationY(state),
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
