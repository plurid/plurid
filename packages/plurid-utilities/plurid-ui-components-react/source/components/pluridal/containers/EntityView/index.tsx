// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
        forwardRef,
        useImperativeHandle,
    } from 'react';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconReset,
        PluridIconDelete,
    } from '@plurid/plurid-icons-react';

    import {
        useThrottledCallback,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries


    // #region external
    import universal from '../../../universal';

    import {
        EntityViewRefAttributes,
        EntityViewSearchTerm,
    } from '~data/interfaces';
    // #endregion external


    // #region internal
    import {
        StyledEntityView,
        StyledEntityViewTop,
        StyledEntityFilterLine,
        StyledEntityFilterCancel,
        StyledTopButtons,
        StyledEntityListContainer,
        StyledEntityList,
        StyledEntityListItem,
        StyledActionButton,
        StyledNoRows,
    } from './styled';

    import {
        createSearchTerms,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
const {
    buttons: {
        PureButton: PluridPureButton,
    },
    inputs: {
        Textline: PluridTextline,
    },
    markers: {
        Spinner: PluridSpinner,
    },
} = universal;


export interface EntityViewProperties {
    // #region required
        // #region values
        entities: any[];
        searchFields: string[];

        generalTheme: Theme;
        interactionTheme: Theme;

        rowsHeader: JSX.Element;
        rowTemplate: string;
        rows?: JSX.Element[];
        noRows: string;
        // #endregion values

        // #region methods
        abstractRowRenderer: (
            columns: string[],
            data: Record<string, any>,
            methods: Record<string, any>,
        ) => JSX.Element,
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        actionButtonText?: string;
        placeholderText?: string;
        scrollThrottleTime?: number;
        loading?: number;

        rowRenderFields?: string[];
        rowRenderMethods?: any;
        // #endregion values

        // #region methods
        actionButtonClick?: () => void;
        filterUpdate?: (
            value: any,
        ) => void;
        refresh?: () => void;

        actionScrollBottom?: (
            entities: any[],
        ) => void;

        customRowRenderer?: (
            columns: string[],
            data: Record<string, any>,
            methods: Record<string, any>,
        ) => JSX.Element[];
        // #endregion methods
    // #endregion optional
}

export type EntityViewType = EntityViewProperties
    & React.RefAttributes<EntityViewRefAttributes>;


const EntityView: React.ForwardRefExoticComponent<EntityViewType> = forwardRef((
    properties,
    reference,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            entities,
            searchFields,

            generalTheme,
            interactionTheme,

            rowsHeader,
            rowTemplate,
            noRows,
            // #endregion values

            // #region methods
            abstractRowRenderer,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values.
            actionButtonText,
            placeholderText,
            scrollThrottleTime: scrollThrottleTimeProperty,
            loading,

            rowRenderFields,
            rowRenderMethods,
            // #endregion values

            // #region methods
            actionButtonClick,
            filterUpdate,
            refresh,
            actionScrollBottom,
            // #endregion methods
        // #endregion optional
    } = properties;

    const placeholder = placeholderText || 'search';
    const scrollThrottleTime = scrollThrottleTimeProperty ?? 1_000;
    // #endregion properties


    // #region references
    const bottomTimeout = useRef<NodeJS.Timeout | null>();
    const entityList = useRef<HTMLUListElement | null>(null);
    // #endregion references


    // #region state
    const [
        searchTerms,
        setSearchTerms,
    ] = useState<EntityViewSearchTerm[]>(
        createSearchTerms(entities, searchFields),
    );

    const [
        filteredRows,
        setFilteredRows,
    ] = useState<JSX.Element[]>(
        entities.map(
            entity => abstractRowRenderer(
                rowRenderFields || [],
                entity,
                rowRenderMethods || {},
            ),
        ),
    );

    const [
        searchValue,
        setSearchValue,
    ] = useState('');
    const [
        filterLength,
        setFilterLength,
    ] = useState('SMALL');
    const [
        refreshClicked,
        setRefreshClicked,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const handleScroll = useThrottledCallback(() => {
        const element = entityList.current;
        if (!element) {
            return;
        }

        const scrolledAmount = element.scrollTop + element.getBoundingClientRect().height
        const bottomReached = scrolledAmount >= element.scrollHeight;

        if (bottomReached && actionScrollBottom && entities) {
            actionScrollBottom(entities);
        }
    }, scrollThrottleTime);

    const clearFilterValue = () => {
        setSearchValue('');

        if (filterUpdate) {
            filterUpdate('');
        }
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setFilteredRows(
            entities.map(
                entity => abstractRowRenderer(
                    rowRenderFields || [],
                    entity,
                    rowRenderMethods || {},
                ),
            ),
        );

        setSearchTerms(
            createSearchTerms(entities, searchFields),
        );
    }, [
        entities.length,
        JSON.stringify(entities),
    ]);

    useEffect(() => {
        if (refreshClicked) {
            setTimeout(() => {
                setRefreshClicked(false);
            }, 1500);
        }
    }, [
        refreshClicked,
    ]);

    /**
     * Action at Bottom of List.
     */
    useEffect(() => {
        bottomTimeout.current = setTimeout(() => {
            if (entityList.current && actionScrollBottom) {
                entityList.current.addEventListener('scroll', handleScroll);
            }
        }, 100);

        return () => {
            if (bottomTimeout.current) {
                clearTimeout(bottomTimeout.current);
            }

            if (entityList.current && actionScrollBottom) {
                entityList.current.removeEventListener('scroll', handleScroll);
            }
        }
    }, [
        entities,
    ]);

    /**
     * Filter length
     */
    useEffect(() => {
        if (searchValue.length <= 30) {
            if (filterLength !== 'SMALL') {
                setFilterLength('SMALL');
            }
        } else {
            if (filterLength !== 'LARGE') {
                setFilterLength('LARGE');
            }
        }
    }, [
        searchValue,
    ]);

    useImperativeHandle(
        reference,
        () => ({
            resetFilterValue() {
                clearFilterValue();
            },
            getSearchTerms() {
                return searchTerms;
            },
        }),
        [
            JSON.stringify(searchTerms),
        ],
    );
    // #endregion effects


    // #region render
    return (
        <StyledEntityView
            theme={generalTheme}
        >
            {!!loading
            && (
                <PluridSpinner
                    theme={generalTheme}
                />
            )}

            <StyledEntityViewTop>
                <StyledEntityFilterLine>
                    <PluridTextline
                        text={searchValue}
                        placeholder={placeholder}
                        atChange={(event) => {
                            const {
                                value,
                            } = event.target;

                            setSearchValue(value);

                            if (filterUpdate) {
                                filterUpdate(value);
                            }
                        }}
                        atKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                clearFilterValue();
                            }
                        }}
                        theme={interactionTheme}
                        spellCheck={false}
                        autoCapitalize="false"
                        autoComplete="false"
                        autoCorrect="false"
                        level={2}
                        style={{
                            width: filterLength === 'SMALL' ? '300px' : '600px',
                            paddingRight: '2rem',
                        }}
                    />

                    {searchValue && (
                        <StyledEntityFilterCancel
                            filterLength={filterLength}
                        >
                            <PluridIconDelete
                                atClick={() => {
                                    clearFilterValue();
                                }}
                            />
                        </StyledEntityFilterCancel>
                    )}
                </StyledEntityFilterLine>

                <StyledTopButtons>
                    {refresh
                    && !refreshClicked
                    && (
                        <PluridIconReset
                            atClick={() => {
                                setRefreshClicked(true);
                                refresh();
                            }}
                            theme={generalTheme}
                        />
                    )}
                </StyledTopButtons>
            </StyledEntityViewTop>

            {filteredRows.length === 0 && (
                <StyledNoRows>
                    {noRows}
                </StyledNoRows>
            )}

            {filteredRows.length !== 0 && (
                <StyledEntityListContainer
                    theme={generalTheme}
                >
                    <StyledEntityList
                        theme={generalTheme}
                        header={true}
                    >
                        <StyledEntityListItem
                            rowTemplate={rowTemplate}
                        >
                            {rowsHeader}
                        </StyledEntityListItem>
                    </StyledEntityList>

                    <StyledEntityList
                        theme={generalTheme}
                        ref={entityList}
                        loading={loading}
                    >
                        {filteredRows.map(row => (
                            <StyledEntityListItem
                                key={Math.random() + ''}
                                rowTemplate={rowTemplate}
                            >
                                {row}
                            </StyledEntityListItem>
                        ))}
                    </StyledEntityList>
                </StyledEntityListContainer>
            )}

            {actionButtonText && (
                <StyledActionButton>
                    <PluridPureButton
                        text={actionButtonText}
                        atClick={() => actionButtonClick
                            ? actionButtonClick()
                            : undefined
                        }
                        theme={interactionTheme}
                        level={2}
                    />
                </StyledActionButton>
            )}
        </StyledEntityView>
    );
    // #endregion render
});
// #endregion module



// #region exports
export default EntityView;
// #endregion exports
