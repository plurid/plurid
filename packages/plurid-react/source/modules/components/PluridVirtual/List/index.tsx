import React from 'react';



interface PluridVirtualListOwnProperties {
    items: JSX.Element[];
}

const PluridVirtualList: React.FC<PluridVirtualListOwnProperties> = (properties) => {
    const {
        items,
    } = properties;

    const renderRows = () => {
        return (
            <>
                {items.map((element, index) => {
                    return (
                        <div
                            key={index}
                        >
                            {element}
                        </div>
                    );
                })}
            </>
        );
    }

    return (
        <div>
            {renderRows()}
        </div>
    );
}


export default PluridVirtualList;
