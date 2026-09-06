// #region module
interface PlaneFollowers {
    followers: Set<() => void>;
    frame: number;
    onScroll: () => void;
}

const registry: WeakMap<HTMLElement, PlaneFollowers> = new WeakMap();

/**
 * Follow the scrolls INSIDE a plane: one capture-phase `scroll` listener per plane element (a
 * `scroll` does not bubble; capture on the ancestor catches every scroller inside it), one
 * animation frame per plane, every open link's follower run in it. Returns the unsubscribe.
 */
export const followPlaneScroll = (
    planeElement: HTMLElement,
    follower: () => void,
): (() => void) => {
    let entry = registry.get(planeElement);
    if (!entry) {
        const created: PlaneFollowers = {
            followers: new Set(),
            frame: 0,
            onScroll: () => {
                if (created.frame || typeof requestAnimationFrame !== 'function') {
                    return;
                }
                created.frame = requestAnimationFrame(() => {
                    created.frame = 0;
                    for (const run of created.followers) {
                        run();
                    }
                });
            },
        };
        planeElement.addEventListener('scroll', created.onScroll, true);
        registry.set(planeElement, created);
        entry = created;
    }
    entry.followers.add(follower);

    return () => {
        const current = registry.get(planeElement);
        if (!current) {
            return;
        }
        current.followers.delete(follower);
        if (current.followers.size === 0) {
            planeElement.removeEventListener('scroll', current.onScroll, true);
            if (current.frame && typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(current.frame);
            }
            registry.delete(planeElement);
        }
    };
};
// #endregion module
