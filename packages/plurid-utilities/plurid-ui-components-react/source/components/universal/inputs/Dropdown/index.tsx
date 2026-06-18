// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';

    import {
        plurid,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconReset,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        PluridUIDropdownSelectable,
    } from '~data/interfaces';

    import Textline from '../Textline';
    // #endregion external


    // #region internal
    import {
        StyledDropdown,
        StyledDropdownSelected,
        StyledDropdownList,
        StyledFilterable,
        StyledFilterUpdate,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface DropdownProperties {
    // #region required
        // #region values
        selectables: (PluridUIDropdownSelectable | string)[];
        selected: PluridUIDropdownSelectable | string;
        // #endregion values

        // #region methods
        atSelect: (
            selection: PluridUIDropdownSelectable | string,
            kind?: string,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        left?: boolean;
        kind?: string;
        listTop?: string;
        dropdownToggled?: boolean;
        dropdownSign?: string | boolean;

        /**
         * Hide dropdown after click selection.
         *
         * Default `true`.
         */
        hideAtSelect?: boolean;
        /**
         * Run the `atSelect` function when hovering over a dropdown item.
         *
         * Default `true`.
         */
        selectAtHover?: boolean;
        selectedColor?: string;

        /**
         * Inserts an input field to filter the selectables.
         */
        filterable?: boolean;

        style?: React.CSSProperties;
        className?: string;

        theme?: Theme;
        generalTheme?: Theme;
        interactionTheme?: Theme;
        level?: number;
        devisible?: boolean;
        round?: boolean;
        width?: string | number;

        /**
         * The number of items determining the height;
         */
        heightItems?: number;
        // #endregion values

        // #region methods
        setDropdownToggled?: any;
        filterUpdate?: () => void;
        // #endregion methods
    // #endregion optional
}

const Dropdown: React.FC<DropdownProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            selected,
            selectables,
            // #endregion values

            // #region methods
            atSelect,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            left,
            kind,
            listTop,
            dropdownToggled,
            dropdownSign,
            hideAtSelect,
            selectAtHover,
            selectedColor,
            filterable,

            style,
            className,

            theme: themeProperty,
            generalTheme: generalThemeProperty,
            interactionTheme: interactionThemeProperty,
            level,

            heightItems,
            width,
            // #endregion values

            // #region methods
            setDropdownToggled,
            filterUpdate,
            // #endregion methods
        // #endregion optional
    } = properties;

    const _generalTheme = generalThemeProperty === undefined
        ? themeProperty === undefined
            ? plurid
            : themeProperty
        : generalThemeProperty;

    const _interactionTheme = interactionThemeProperty === undefined
        ? themeProperty === undefined
            ? plurid
            : themeProperty
        : interactionThemeProperty;

    const _level = level ?? 0;
    const _hideAtSelect = hideAtSelect ?? true;
    const _selectAtHover = selectAtHover ?? false;

    const _dropdownSign = typeof dropdownSign === 'string'
        ? dropdownSign
        : !dropdownSign
            ? ''
            : '▼';
    // #endregion properties


    // #region references
    const isMounted = useRef(true);
    const filterInput = useRef<HTMLInputElement | null>(null);
    // #endregion references


    // #region state
    const [
        generalTheme,
        setGeneralTheme,
    ] = useState(_generalTheme);
    const [
        interactionTheme,
        setInteractionTheme,
    ] = useState(_interactionTheme);

    const [
        showList,
        setShowList,
    ] = useState(false);
    const [
        selectedBackgroundColor,
        setSelectedBackgroundColor,
    ] = useState(interactionTheme.backgroundColorTertiary);
    const [
        filterValue,
        setFilterValue,
    ] = useState('');
    const [
        filteredSelectables,
        setFilteredSelectables,
    ] = useState([
        ...selectables,
    ]);

    const [
        showFilterUpdate,
        setShowFilterUpdate,
    ] = useState(!!filterUpdate);

    const [
        arrowIndex,
        setArrowIndex,
    ] = useState(-1);
    // #endregion state


    // #region handlers
    const select = (
        selected: string | PluridUIDropdownSelectable,
    ) => {
        kind
            ? atSelect(selected, kind)
            : atSelect(selected);
    }

    const handleSelect = (
        selected: string | PluridUIDropdownSelectable,
    ) => {
        select(selected);

        if (_hideAtSelect) {
            setShowList(false);
        }
    }

    const handleHover = (
        selected: string | PluridUIDropdownSelectable,
    ) => {
        if (_selectAtHover) {
            select(selected);
        }
    }

    const handleFiltering = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const {
            value,
        } = event.target;

        const filterValue = value.toLowerCase();

        const filteredSelectables = selectables.filter(selectable => {
            if (typeof selectable === 'string') {
                const filterSelectable = selectable.toLowerCase();

                if (selectable.toLowerCase().startsWith(filterValue)) {
                    return true;
                }

                const split = filterSelectable.split(' ');

                for (const element of split) {
                    if (element.startsWith(filterValue)) {
                        return true;
                    }
                }

                return false;
            }


            const filterSelectable = selectable.value.toLowerCase();

            if (filterSelectable.startsWith(filterValue)) {
                return true;
            }

            const split = filterSelectable.split(' ');

            for (const element of split) {
                if (element.startsWith(filterValue)) {
                    return true;
                }
            }

            return false;
        });

        setFilterValue(value);
        setFilteredSelectables(filteredSelectables);

        itemsReferences.current = filteredSelectables.reduce((accumulator, _, index) => {
            (accumulator as any)[index] = React.createRef();
            return accumulator;
        }, {});
    }

    const focusFilterInput = () => {
        setTimeout(() => {
            if (filterInput.current) {
                filterInput.current.focus();
            }
        }, 100);
    }
    // #endregion handlersn


    // #region references
    const itemsReferences = useRef<Record<number, any>>(
        filteredSelectables.reduce((accumulator, _, index) => {
            (accumulator as Record<number, any>)[index] = React.createRef();
            return accumulator;
        }, {}),
    );
    // #endregion references


    // #region effects
    /** Handle Dropdown */
    useEffect(() => {
        if (!dropdownToggled) {
            setShowList(false);
        }
    }, [
        dropdownToggled,
    ]);

    /** Handle Level */
    useEffect(() => {
        if (_level === 2) {
            setSelectedBackgroundColor(interactionTheme.backgroundColorSecondary);
        } else {
            setSelectedBackgroundColor(interactionTheme.backgroundColorTertiary);
        }
    }, [
        _level,
        interactionTheme,
    ]);

    /** Handle Themes */
    useEffect(() => {
        const generalTheme = generalThemeProperty === undefined
            ? themeProperty === undefined
                ? plurid
                : themeProperty
            : generalThemeProperty;

        const interactionTheme = interactionThemeProperty === undefined
            ? themeProperty === undefined
                ? plurid
                : themeProperty
            : interactionThemeProperty;

        setGeneralTheme(generalTheme);
        setInteractionTheme(interactionTheme);
    }, [
        themeProperty,
        generalThemeProperty,
        interactionThemeProperty,
    ]);

    /**
     * Handle Arrows.
     */
    useEffect(() => {
        const scrollTo = (
            index: number,
        ) => {
            if (itemsReferences.current[index].current) {
                itemsReferences.current[index].current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }

        const handleArrows = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'ArrowUp') {
                const newIndex = arrowIndex - 1;

                if (newIndex >= 0) {
                    setArrowIndex(newIndex);
                    scrollTo(newIndex);
                }
            }

            if (event.key === 'ArrowDown') {
                const newIndex = arrowIndex + 1;

                if (newIndex < filteredSelectables.length) {
                    setArrowIndex(newIndex);
                    scrollTo(newIndex);
                }
            }

            if (event.key === 'Enter') {
                const selected = filteredSelectables[arrowIndex];

                if (selected) {
                    atSelect(selected);
                    setArrowIndex(-1);

                    if (_hideAtSelect) {
                        setShowList(false);
                    }
                }
            }
        }

        const handleScroll = () => {
            setArrowIndex(-1);
        }

        if (showList) {
            window.addEventListener('keydown', handleArrows);
            window.addEventListener('wheel', handleScroll);
        } else {
            setArrowIndex(-1);
        }

        return () => {
            if (showList) {
                window.removeEventListener('keydown', handleArrows);
                window.removeEventListener('wheel', handleScroll);
            }
        }
    }, [
        arrowIndex,
        showList,
    ]);

    /**
     * Is mounted.
     */
    useEffect(() => {
        return () => {
            isMounted.current = false;
        }
    }, []);

    /**
     * Selectables update.
     */
    useEffect(() => {
        setFilteredSelectables(
            [
                ...selectables,
            ],
        );
    }, [
        selectables.length,
    ]);
    // #endregion effects


    // #region render
    return (
        <StyledDropdown
            theme={interactionTheme}
            left={left}
            style={{...style}}
            className={className}
        >
            <StyledDropdownSelected
                onClick={() => {
                    setShowList(!showList);

                    if (setDropdownToggled) {
                        setDropdownToggled(kind);
                    }

                    if (!showList && filterable) {
                        focusFilterInput();
                    }
                }}
                theme={generalTheme}
                selectedColor={selectedColor}
            >
                {typeof selected === 'string'
                    ? selected
                    : selected.value
                }
                {_dropdownSign && (
                    <>
                        &nbsp;{_dropdownSign}
                    </>
                )}
            </StyledDropdownSelected>

            {showList && (
                <StyledDropdownList
                    theme={interactionTheme}
                    left={left}
                    listTop={listTop}
                    level={_level}
                    heightItems={heightItems && filterable && filteredSelectables.length < heightItems
                        ? filteredSelectables.length + 1
                        : heightItems
                    }
                    heightBeyond={filteredSelectables.length > (heightItems || 0)}
                    width={width}
                >
                    <ul>
                        {filterable && (
                            <li
                                style={{
                                    backgroundColor: interactionTheme.backgroundColorTertiary,
                                    boxShadow: interactionTheme.boxShadowPenumbraInset,
                                }}
                            >
                                <StyledFilterable
                                    left={left}
                                >
                                    {filterUpdate
                                    && showFilterUpdate
                                    && (
                                        <StyledFilterUpdate
                                            left={left}
                                        >
                                            <PluridIconReset
                                                theme={interactionTheme}
                                                atClick={() => {
                                                    setShowFilterUpdate(false);
                                                    filterUpdate();

                                                    setTimeout(() => {
                                                        if (!isMounted.current) {
                                                            return;
                                                        }

                                                        setShowFilterUpdate(true);
                                                    }, 5300);
                                                }}
                                            />
                                        </StyledFilterUpdate>
                                    )}

                                    <Textline
                                        ref={filterInput}
                                        theme={interactionTheme}
                                        text={filterValue}
                                        atChange={handleFiltering}
                                        devisible={true}
                                        spellCheck={false}
                                        autoCapitalize="false"
                                        autoComplete="false"
                                        autoCorrect="false"
                                        style={{
                                            padding: !!filterUpdate
                                                ? left
                                                    ? '0 1.3rem 0 0'
                                                    : '0 0 0 1.3rem'
                                                : '0'
                                        }}
                                    />
                                </StyledFilterable>
                            </li>
                        )}

                        {filteredSelectables.map((selectable, index) => {
                            let selectableID = typeof selectable === 'string'
                                ? selectable
                                : selectable.id;
                            let selectableValue = typeof selectable === 'string'
                                ? selectable
                                : selectable.value;

                            let isSelected = false;
                            if (typeof selected === 'string') {
                                if (selected === selectableID) {
                                    isSelected = true;
                                }
                            } else {
                                if (selected.id === selectableID) {
                                    isSelected = true;
                                }
                            }

                            if (arrowIndex === index) {
                                isSelected = true;
                            }

                            return (
                                <li
                                    ref={itemsReferences.current[index]}
                                    key={selectableID}
                                    onClick={() => handleSelect(selectable)}
                                    onMouseEnter={() => handleHover(selectable)}
                                    style={{
                                        backgroundColor: isSelected
                                            ? selectedBackgroundColor
                                            : '',
                                    }}
                                >
                                    {selectableValue}
                                </li>
                            );
                        })}
                    </ul>
                </StyledDropdownList>
            )}
        </StyledDropdown>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Dropdown;
// #endregion exports
