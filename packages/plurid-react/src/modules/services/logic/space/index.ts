import {
    PluridPage,
} from '../../../data/interfaces';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import uuid from '../../utilities/uuid';

import {
    TreePage,
} from '../../../data/interfaces';

import {
    ROOTS_GAP,
} from '../../../data/constants/space';

import actions from '../../state/actions';



export const computeSpaceTree = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    pages: PluridPage[],
) => {
    const tree: TreePage[] = [];

    pages.forEach((page, index) => {
        if (page.root) {
            const translateX = index === 0
                ? 0
                : window.innerWidth * index + ROOTS_GAP;

            const treePage = {
                path: page.path,
                planeId: uuid(),
                location: {
                    translateX,
                    translateY: 0,
                    translateZ: 0,
                    rotateX: 0,
                    rotateY: 0,
                    // translateX: Math.random() * 1000,
                    // translateY: Math.random() * 200,
                    // translateZ: Math.random() * 100,
                    // rotateX: 0,
                    // rotateY: Math.random() * 80,
                },
            };
            tree.push(treePage);
        }
    });

    console.log(tree);
    dispatch(actions.space.setTree(tree));
}



export const recomputeSpaceTreeLocations = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    tree: TreePage[],
) => {
    const updatedTree: TreePage[] = [];
    console.log(tree);

    tree.forEach((page, index) => {
        const _page = { ...page };

        const translateX = index === 0
            ? 0
            : window.innerWidth * index + ROOTS_GAP;
        _page.location.translateX = translateX;
        updatedTree.push(_page);
    });

    dispatch(actions.space.setTree(updatedTree));
}
