import React, {
    useRef,
    useEffect,
    useState,
} from 'react';



const sumTo = (
    values: number[],
    index: number,
) => {
    const _values = values.slice(0, index === 0 ? 1 : index);
    return _values.reduce((total, val) => total + val);
}


interface VirtualListItemOwnProperties {
    top: number;
    index: number;
    element: JSX.Element;
    setHeight: any;
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

    const _generalHeight = generalHeight || 50;

    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(Math.floor(1200 / _generalHeight));

    const rows = useRef<any[]>([]);
    const heights = useRef<number[]>(Array(end - start).fill(0));

    const renderRows = () => {
        rows.current = [];
        // heights.current= Array(end - start).fill(0);
        console.log('foo', heights.current);

        for (let i = start; i <= end; i++) {
            let item = items[i];
            rows.current.push(
                <VirtualListItem
                    key={i + Math.random()}
                    index={i}
                    top={sumTo(heights.current, i)}
                    // top={20}
                    element={item}
                    setHeight={setHeight}
                />
            );
        }
        return rows.current;
    }

    const setHeight = (
        value: number,
        index: number,
    ) => {
        heights.current[index] = value;
    }

    console.log(rows.current);
    console.log(heights.current);

    return (
        <div
            style={{
                height: sumTo(heights.current, heights.current.length),
            }}
            onClick={() => console.log(rows.current)}
        >
            {renderRows()}
        </div>
    );
}


export default PluridVirtualList;
