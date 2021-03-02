import React, {
    useState,
} from 'react';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledDropdown,
    StyledDropdownSelected,
    StyledDropdownList,
} from './styled';



export interface DropdownProps {
    selected: string;
    items: any;
    onSelect: any;
    theme: Theme;
}

const Dropdown: React.FC<DropdownProps> = (
    properties,
) => {
    /** properties */
    const {
        selected,
        items,
        onSelect,
        theme,
    } = properties;


    /** state */
    const [
        showList,
        setShowList,
    ] = useState(false);


    /** render */
    return (
        <StyledDropdown>
            <StyledDropdownSelected
                onClick={() => {
                    setShowList(!showList);
                }}
            >
                {selected}
            </StyledDropdownSelected>

            {showList && (
                <StyledDropdownList
                    theme={theme}
                >
                    <ul>
                        {items.map((item: any) => {
                            return (
                                <li
                                    key={item}
                                    onClick={() => onSelect(item)}
                                    style={{backgroundColor: selected === item ? theme.backgroundColorTertiary : ''}}
                                >
                                    {item}
                                </li>
                            );
                        })}
                    </ul>
                </StyledDropdownList>
            )}
        </StyledDropdown>
    );
}


export default Dropdown;
