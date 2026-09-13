// #region imports
    // #region libraries
    import React, {
        useMemo,
        useRef,
        useState,
    } from 'react';

    import {
        PluridNamedViewpoint,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        usePluridBookmarks,
    } from '~services/hooks/bookmarks';
    import {
        useEngineSelector,
    } from '~services/hooks/engine';

    import ViewpointThumb, {
        THUMB_FRAME,
    } from '~components/utilities/ViewpointThumb';
    import {
        computeMinimapLayout,
    } from '~components/utilities/Minimap/logic';
    // #endregion external


    // #region internal
    import {
        StyledBookmarksSave,
        StyledBookmarksField,
        StyledBookmarksButton,
        StyledBookmarksEmpty,
        StyledBookmarksGroup,
        StyledBookmarksList,
        StyledBookmarkRow,
        StyledBookmarkGo,
        StyledBookmarkThumb,
        StyledBookmarkName,
        StyledBookmarkActions,
        StyledBookmarkAction,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const IconRename = () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 10.5 10 4l2 2-6.5 6.5-2.7.7z" />
    </svg>
);

const IconRemove = () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </svg>
);

const IconSetHome = () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3v6M5.5 6.5 8 9l2.5-2.5M3.5 12.5h9" />
    </svg>
);


/**
 * THE BOOKMARKS, as a drawer: name the view you are looking at and save it; every saved view, the
 * host's presets and the home viewpoint listed with A PICTURE OF WHERE THEY LOOK — the minimap's
 * projection of the live tree with the saved camera's ring on it (`ViewpointThumb`), computed, so a
 * thumbnail is right after any relayout instead of being a stale screenshot. A click travels there
 * (the same command the palette's row and the `space.bookmark` topic run); a rename keeps the row
 * where it is; presets and home cannot be edited, only visited — and home can be re-set to the
 * view you are on.
 */
const MenuMoreBookmarks: React.FC = () => {
    const {
        home,
        bookmarks,
        presets,
        save,
        go,
        remove,
        rename,
        setHome,
    } = usePluridBookmarks();

    const tree = useEngineSelector((state) => state.space.tree);
    const viewSize = useEngineSelector((state) => state.space.viewSize);
    const configuration = useEngineSelector((state) => state.configuration);

    // ONE projection for every row: the space is the same in each thumb, only the ring moves
    const layout = useMemo(
        () => computeMinimapLayout({
            tree,
            viewSize,
            configuration,
            ...THUMB_FRAME,
        }),
        [tree, viewSize, configuration],
    );

    const [draft, setDraft] = useState('');
    const [editing, setEditing] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    /** An Escape closes the rename without committing — and its blur must not commit either. */
    const abandonEdit = useRef(false);

    const name = draft.trim();
    const taken = bookmarks.some((bookmark) => bookmark.name === name);

    const handleSave = () => {
        if (!name) {
            return;
        }
        save(name);
        setDraft('');
    };

    const startEdit = (entry: PluridNamedViewpoint) => {
        abandonEdit.current = false;
        setEditDraft(entry.name);
        setEditing(entry.name);
    };

    const commitEdit = (from: string) => {
        if (abandonEdit.current) {
            abandonEdit.current = false;
            setEditing(null);
            return;
        }
        const next = editDraft.trim();
        if (next && next !== from) {
            rename(from, next);
        }
        setEditing(null);
    };

    const row = (
        entry: PluridNamedViewpoint,
        actions?: React.ReactNode,
    ) => (
        <StyledBookmarkRow
            key={entry.id}
            role="listitem"
            data-plurid-bookmark={entry.name || entry.source}
            data-plurid-bookmark-source={entry.source}
        >
            {editing === entry.name && entry.editable ? (
                <>
                    <StyledBookmarkThumb>
                        <ViewpointThumb
                            layout={layout}
                            camera={entry.camera}
                            viewSize={viewSize}
                        />
                    </StyledBookmarkThumb>

                    <StyledBookmarksField
                        autoFocus
                        value={editDraft}
                        aria-label={'Rename the bookmark ' + entry.name}
                        data-plurid-control="bookmark-rename-input"
                        onChange={(event) => setEditDraft(event.target.value)}
                        onBlur={() => commitEdit(entry.name)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                commitEdit(entry.name);
                            }
                            if (event.key === 'Escape') {
                                event.preventDefault();
                                event.stopPropagation();
                                abandonEdit.current = true;
                                setEditing(null);
                            }
                        }}
                    />
                </>
            ) : (
                <>
                    <StyledBookmarkGo
                        type="button"
                        title={'Go to ' + entry.label}
                        aria-label={'Go to ' + entry.label}
                        data-plurid-control="bookmark-go"
                        onClick={() => go(entry)}
                    >
                        <StyledBookmarkThumb>
                            <ViewpointThumb
                                layout={layout}
                                camera={entry.camera}
                                viewSize={viewSize}
                            />
                        </StyledBookmarkThumb>

                        <StyledBookmarkName>
                            {entry.label}
                        </StyledBookmarkName>
                    </StyledBookmarkGo>

                    <StyledBookmarkActions>
                        {actions}
                    </StyledBookmarkActions>
                </>
            )}
        </StyledBookmarkRow>
    );

    return (
        <>
            <StyledBookmarksSave>
                <StyledBookmarksField
                    value={draft}
                    placeholder="name this view"
                    aria-label="Name the current view"
                    data-plurid-control="bookmark-name"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSave();
                        }
                    }}
                />

                <StyledBookmarksButton
                    type="button"
                    disabled={!name}
                    title={taken ? 'Overwrite ' + name + ' with this view' : 'Save this view'}
                    data-plurid-control="bookmark-save"
                    onClick={handleSave}
                >
                    {taken ? 'update' : 'save'}
                </StyledBookmarksButton>
            </StyledBookmarksSave>

            {bookmarks.length === 0 && (
                <StyledBookmarksEmpty>
                    no bookmarks yet — frame a view, name it, save it
                </StyledBookmarksEmpty>
            )}

            <StyledBookmarksList
                role="list"
                aria-label="Bookmarks"
            >
                {row(home, (
                    <StyledBookmarkAction
                        type="button"
                        title="Make this view home"
                        aria-label="Make this view the home viewpoint"
                        data-plurid-control="bookmark-home-set"
                        onClick={() => setHome()}
                    >
                        <IconSetHome />
                    </StyledBookmarkAction>
                ))}

                {bookmarks.map((entry) => row(entry, (
                    <>
                        <StyledBookmarkAction
                            type="button"
                            title={'Rename ' + entry.name}
                            aria-label={'Rename the bookmark ' + entry.name}
                            data-plurid-control="bookmark-rename"
                            onClick={() => startEdit(entry)}
                        >
                            <IconRename />
                        </StyledBookmarkAction>

                        <StyledBookmarkAction
                            type="button"
                            title={'Remove ' + entry.name}
                            aria-label={'Remove the bookmark ' + entry.name}
                            data-plurid-control="bookmark-remove"
                            onClick={() => remove(entry.name)}
                        >
                            <IconRemove />
                        </StyledBookmarkAction>
                    </>
                )))}

                {presets.length > 0 && (
                    <StyledBookmarksGroup>
                        presets
                    </StyledBookmarksGroup>
                )}

                {presets.map((entry) => row(entry))}
            </StyledBookmarksList>
        </>
    );
}
// #endregion module



// #region exports
export default MenuMoreBookmarks;
// #endregion exports
