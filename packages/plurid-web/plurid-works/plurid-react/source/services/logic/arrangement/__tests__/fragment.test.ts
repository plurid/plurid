// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        treePlane,
    } from '../../../../testing/fixtures';
    // #endregion external


    // #region internal
    import {
        FRAGMENT_MARKER,
        FRAGMENT_VERSION,
        fragmentOf,
        serializeFragment,
        parseFragment,
        materializeFragment,
    } from '../fragment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE ARRANGEMENT FRAGMENT: a piece of a space as text, addressed by PATH — so what was copied on
 * one host pastes on another, as that host's own planes. A paste asks the target to make each path
 * into a plane the way opening it would, places what comes back, and drops — by name — the paths it
 * does not register.
 */
const address = (
    path: string,
) => 'plurid://source.example' + path;

/** A plane as the SOURCE space holds it: an absolute route carrying the host it was made on. */
const plane = (
    path: string,
    overrides: Partial<TreePlane> = {},
): TreePlane => ({
    ...treePlane(path),
    sourceID: address(path),
    planeID: address(path) + '@one',
    route: address(path),
    ...overrides,
});

const space = () => {
    const a = plane('/a', { location: { rotateX: 0, rotateY: 0, translateX: 100, translateY: 50, translateZ: 0 } });
    const b = plane('/b', { location: { rotateX: 0, rotateY: 0, translateX: 900, translateY: 50, translateZ: 0 } });
    a.children = [plane('/a/detail', {
        parentPlaneID: a.planeID,
        spawnedByLinkID: a.planeID + '#/a/detail#0',
        linkCoordinates: { x: 10, y: 20 },
        bridgeLength: 120,
        bridgeSide: 'end',
    })];
    return {
        tree: [a, b],
        links: [
            { id: 'L1', sourcePlaneID: a.planeID, targetPlaneID: b.planeID, kind: 'reference' },
            { id: 'L2', sourcePlaneID: a.planeID, targetPlaneID: a.children[0].planeID },
        ] as PlaneLink[],
    };
};

/** The TARGET space: it makes a plane of its own for every path it knows, as `resolveViewItem` does. */
const target = (
    known: string[],
) => {
    let count = 0;
    return (path: string): TreePlane | undefined => {
        if (!known.includes(path)) {
            return undefined;
        }
        count += 1;
        const route = 'plurid://target.example' + path;
        return {
            ...treePlane(path),
            sourceID: route,
            planeID: route + '@' + count,
            route,
            width: 0,
            height: 0,
        };
    };
};


describe('the arrangement fragment', () => {
    it('copies the named planes by PATH, with their subtrees and only the links among them', () => {
        const { tree, links } = space();
        const fragment = fragmentOf(tree, [tree[0].planeID], links, 'source.example')!;

        expect(fragment.plurid).toBe(FRAGMENT_MARKER);
        expect(fragment.version).toBe(FRAGMENT_VERSION);
        expect(fragment.planes.map((node) => node.path)).toEqual(['/a']);
        expect(fragment.planes[0].children!.map((node) => node.path)).toEqual(['/a/detail']);
        expect(fragment.planes[0].location.translateX).toBe(100);
        // the link to a plane left behind does not travel; the one inside the copy does
        expect(fragment.links).toHaveLength(1);
        expect(fragment.links[0].targetID).toBe(tree[0].children![0].planeID);
        expect(fragment.origin?.host).toBe('source.example');

        // a root of the fragment carries no bridge of its own; the child carries all of it
        expect(fragment.planes[0].bridge).toBeUndefined();
        expect(fragment.planes[0].linkSuffix).toBeUndefined();
        const child = fragment.planes[0].children![0];
        expect(child.bridge).toEqual({ length: 120, side: 'end', coordinates: { x: 10, y: 20 } });
        expect(child.linkSuffix).toBe('#/a/detail#0');

        expect(fragmentOf(tree, [], links)).toBeNull();
        expect(fragmentOf(tree, ['nothing'], links)).toBeNull();
    });

    it('a child copied alone becomes a root; a child copied inside its parent travels once', () => {
        const { tree, links } = space();
        const child = tree[0].children![0];

        const alone = fragmentOf(tree, [child.planeID], links)!;
        expect(alone.planes.map((node) => node.path)).toEqual(['/a/detail']);
        expect(alone.planes[0].linkSuffix).toBeUndefined();

        const both = fragmentOf(tree, [tree[0].planeID, child.planeID], links)!;
        expect(both.planes).toHaveLength(1);
        expect(both.planes[0].children).toHaveLength(1);
    });

    it('round-trips as text, and anything else parses to null', () => {
        const { tree, links } = space();
        const text = serializeFragment(fragmentOf(tree, [tree[0].planeID, tree[1].planeID], links)!);
        expect(parseFragment(text)!.planes.map((node) => node.path)).toEqual(['/a', '/b']);
        // the host it was copied on is not in the identities
        expect(text).not.toContain('source.example/a"');

        expect(parseFragment('')).toBeNull();
        expect(parseFragment(null)).toBeNull();
        expect(parseFragment('a paragraph of ordinary text')).toBeNull();
        expect(parseFragment('{"plurid":"plurid/arrangement"')).toBeNull();
        expect(parseFragment(JSON.stringify({ plurid: FRAGMENT_MARKER, version: 99, planes: [{ id: 'x', path: '/a' }] }))).toBeNull();
        expect(parseFragment(JSON.stringify({ plurid: 'other', version: 1, planes: [{ id: 'x', path: '/a' }] }))).toBeNull();
        expect(parseFragment(JSON.stringify({ plurid: FRAGMENT_MARKER, version: 1, planes: [] }))).toBeNull();
    });

    it('pastes into ANOTHER host as that host\'s own planes, the subtree and the links following', () => {
        const { tree, links } = space();
        const fragment = fragmentOf(tree, [tree[0].planeID], links)!;

        const landed = materializeFragment(fragment, {
            resolve: target(['/a', '/a/detail']),
            offset: { x: 40, y: 40 },
        });

        const root = landed.planes[0];
        // the pasted plane is the TARGET\'s: its route, its id shape, its host
        expect(root.route).toBe('plurid://target.example/a');
        expect(root.planeID.startsWith('plurid://target.example/a@')).toBe(true);
        expect(root.manuallyPositioned).toBe(true);
        expect(root.location.translateX).toBe(140);
        expect(root.location.translateY).toBe(90);

        const child = root.children![0];
        expect(child.route).toBe('plurid://target.example/a/detail');
        expect(child.parentPlaneID).toBe(root.planeID);
        // the link that spawned it follows the new parent, so the pasted parent\'s own link owns it
        expect(child.spawnedByLinkID).toBe(root.planeID + '#/a/detail#0');
        expect(child.bridgeLength).toBe(120);
        expect(child.bridgeSide).toBe('end');
        // a child is placed by its parent, never offset on its own
        expect(child.location.translateX).toBe(0);

        expect(landed.links).toHaveLength(1);
        expect(landed.links[0].sourcePlaneID).toBe(root.planeID);
        expect(landed.links[0].targetPlaneID).toBe(child.planeID);
        expect(landed.dropped).toEqual([]);
    });

    it('a link that declared its own id cannot follow: the pasted child keeps none', () => {
        const { tree, links } = space();
        tree[0].children![0].spawnedByLinkID = 'a-host-declared-id';
        const fragment = fragmentOf(tree, [tree[0].planeID], links)!;
        expect(fragment.planes[0].children![0].linkSuffix).toBeUndefined();

        const landed = materializeFragment(fragment, { resolve: target(['/a', '/a/detail']) });
        expect(landed.planes[0].children![0].spawnedByLinkID).toBeUndefined();
    });

    it('a path the target does not register is dropped with its subtree, its links and its name', () => {
        const { tree, links } = space();
        const fragment = fragmentOf(tree, [tree[0].planeID, tree[1].planeID], links)!;

        const landed = materializeFragment(fragment, { resolve: target(['/b']) });

        expect(landed.planes.map((node) => node.route)).toEqual(['plurid://target.example/b']);
        expect(landed.links).toEqual([]);
        expect(landed.dropped).toEqual(['/a']);
    });

    it('the new ids never collide — with the target\'s planes, or with an earlier paste', () => {
        const { tree, links } = space();
        const fragment = fragmentOf(tree, [tree[0].planeID], links)!;
        // a target that hands out ONE id for every path: the collision is the fragment\'s to resolve
        const one = (path: string): TreePlane | undefined => ({
            ...treePlane(path),
            planeID: 'plurid://target.example' + path + '@fixed',
            route: 'plurid://target.example' + path,
        });

        const taken = new Set<string>();
        for (let paste = 0; paste < 3; paste += 1) {
            const landed = materializeFragment(fragment, { resolve: one, taken });
            for (const node of [landed.planes[0], landed.planes[0].children![0]]) {
                expect(taken.has(node.planeID)).toBe(false);
                taken.add(node.planeID);
            }
        }
        expect(taken.size).toBe(6);
        // and the fragment itself was never touched by any of them
        expect(fragment.planes[0].id).toBe(tree[0].planeID);
    });

    it('a size the target DECLARES wins over the copied one; otherwise the copy carries', () => {
        const { tree, links } = space();
        tree[0].width = 640;
        tree[0].height = 480;
        const fragment = fragmentOf(tree, [tree[0].planeID], links)!;

        const carried = materializeFragment(fragment, { resolve: target(['/a', '/a/detail']) });
        expect(carried.planes[0].width).toBe(640);

        const declares = (path: string) => ({
            ...treePlane(path),
            planeID: 'plurid://target.example' + path + '@d',
            route: 'plurid://target.example' + path,
            width: 300,
            height: 200,
            sizeMode: 'declared' as const,
        });
        const declared = materializeFragment(fragment, { resolve: declares });
        expect(declared.planes[0].width).toBe(300);
        expect(declared.planes[0].sizeMode).toBe('declared');
    });
});
// #endregion module
