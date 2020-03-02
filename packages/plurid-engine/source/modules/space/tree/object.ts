import {
    TreePage,
    PluridConfiguration,
    PluridView,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from './logic';



export interface TreeData {
    pages: TreePage[],
    configuration?: PluridConfiguration,
    view?: string[] | PluridView[],
}

export default class Tree {
    private data: TreeData;

    constructor(
        data: TreeData,
    ) {
        this.data = data;
    }

    public computeTree() {
        const {
            pages,
            configuration,
            view,
        } = this.data;

        return computeSpaceTree(
            pages,
            configuration,
            view,
        );
    }
}
