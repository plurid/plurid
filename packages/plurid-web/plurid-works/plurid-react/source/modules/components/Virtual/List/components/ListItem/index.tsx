// #region imports
    // #region libraries
    import React, {
        useRef,
        useEffect,
    } from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface VirtualListItemOwnProperties {
    top: number;
    index: number;
    element: JSX.Element;
    setHeight(value: number, index: number): void;
}

const VirtualListItem: React.FC<VirtualListItemOwnProperties> = (
    properties,
) => {
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
// #endregion module



// #region exports
export default VirtualListItem;
// #endregion exports
