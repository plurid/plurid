import {
    PluridPage,
} from '../../../data/interfaces';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { TreePage } from '../../state/types/space';

import actions from '../../state/actions';



export const computeSpaceTree = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    pages: PluridPage[]
) => {
    const tree: TreePage[] = [];

    pages.forEach(page => {
        if (page.root) {
            const treePage = {
                path: page.path,
            };
            tree.push(treePage);
        }
    });

    console.log(tree);
    dispatch(actions.space.setTree(tree));
}
