import React, {
    useRef,
    useEffect,
    useState,
} from 'react';



const sumTo = (
    values: number[],
    index: number,
) => {
    if (index === 0 ) {
        return 0;
    }

    const _values = values.slice(
        0,
        index,
    );
    return _values.reduce((total, val) => total + val);
}


interface VirtualListItemOwnProperties {
    top: number;
    index: number;
    element: JSX.Element;
    setHeight(value: number, index: number): void;
}

const VirtualListItem: React.FC<VirtualListItemOwnProperties> = (properties) => {
    const {
        top,
        index,
        element,
        setHeight,
    } = properties;

    const el = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (el.current) {
            setHeight(el.current.offsetHeight, index);
        }
    }, [
        el.current,
    ])

    return (
        <div
            ref={el}
            style={{
                position: 'absolute',
                top: top + 'px',
            }}
        >
            {element}
        </div>
    );
}


interface PluridVirtualListOwnProperties {
    items: JSX.Element[];
    generalHeight?: number;
}

const PluridVirtualList: React.FC<PluridVirtualListOwnProperties> = (properties) => {
    const {
        items,
        generalHeight,
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
                <VirtualListItem
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


export default PluridVirtualList;
