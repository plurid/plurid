import React, {
    useRef,
    useEffect,
} from 'react';



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


export default VirtualListItem;
