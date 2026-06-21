// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        PLURID_PUBSUB_TOPIC,

        TreePlane,
        PlaneLink,
        PluridPubSub as IPluridPubSub,
        PluridCollaborationSnapshot,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        arrangementSignature,
    } from '~services/logic/arrangement/signature';
    // #endregion external
// #endregion imports



// #region module
export interface UseCollaborationParameters {
    /** The instance pubsub (a host's passed-in one, or the View's). Collaboration is wired on it. */
    pubsub: IPluridPubSub | undefined;
    stateTree: TreePlane[];
    stateLinks: PlaneLink[];
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
}


/**
 * The collaboration seam. Transport-agnostic: the engine PUBLISHES a `collaborationMutation` snapshot
 * whenever the shared arrangement actually changes, and APPLIES inbound `applyRemoteMutation`
 * snapshots from peers. The host owns the wire (websocket / y-* / etc.) and presence — it forwards one
 * topic to the other.
 *
 * State-based: a snapshot is `{ tree, links }`. Remote trees are applied with `setSpaceField` (NOT
 * `setTree`) so they bypass the pinned-location carry in `reconcileNode` — a remote MOVE must win over
 * the local pin. Echo is prevented WITHOUT a transport round-trip: applying a remote snapshot pre-sets
 * `lastSignature`, so the very next outbound pass sees no change and stays quiet (last-writer-wins;
 * true CRDT is the product's choice on top). Remote dispatches carry `meta.remote`, so the history
 * middleware leaves them out of the LOCAL undo stack.
 */
export const useCollaboration = (
    {
        pubsub,
        stateTree,
        stateLinks,
        dispatch,
    }: UseCollaborationParameters,
) => {
    const lastSignature = useRef<string | null>(null);
    const initialized = useRef(false);

    // #region outbound
    useEffect(() => {
        if (!pubsub) {
            return;
        }

        const nextSignature = arrangementSignature(stateTree, stateLinks);

        // First pass just establishes the baseline — don't broadcast the initial state (a joining
        // peer resyncs explicitly via the host). Only genuine changes are emitted thereafter.
        if (!initialized.current) {
            initialized.current = true;
            lastSignature.current = nextSignature;
            return;
        }

        if (nextSignature === lastSignature.current) {
            return;
        }
        lastSignature.current = nextSignature;

        pubsub.publish({
            topic: PLURID_PUBSUB_TOPIC.COLLABORATION_MUTATION,
            data: {
                tree: stateTree,
                links: stateLinks,
            },
        });
    }, [
        pubsub,
        stateTree,
        stateLinks,
    ]);
    // #endregion outbound


    // #region inbound
    useEffect(() => {
        if (!pubsub) {
            return;
        }

        const index = pubsub.subscribe({
            topic: PLURID_PUBSUB_TOPIC.APPLY_REMOTE_MUTATION,
            callback: (data: PluridCollaborationSnapshot) => {
                if (!data) {
                    return;
                }

                // Pre-set the baseline to the incoming snapshot so the resulting state change does
                // NOT bounce straight back out as our own mutation.
                lastSignature.current = arrangementSignature(
                    data.tree ?? stateTree,
                    data.links ?? stateLinks,
                );

                if (data.tree) {
                    // `setSpaceField`, not `setTree`: skip `reconcileNode`'s pinned-location carry so a
                    // remote move overrides the local pin. `meta.remote` keeps it out of local undo.
                    dispatch({
                        type: 'space/setSpaceField',
                        payload: { field: 'tree', value: data.tree },
                        meta: { remote: true },
                    } as AnyAction);
                }
                if (data.links) {
                    dispatch({
                        type: 'space/setPlaneLinks',
                        payload: data.links,
                        meta: { remote: true },
                    } as AnyAction);
                }
            },
        });

        return () => {
            pubsub.unsubscribe(index);
        };
    }, [
        pubsub,
        dispatch,
    ]);
    // #endregion inbound
}
// #endregion module



// #region exports
export default useCollaboration;
// #endregion exports
