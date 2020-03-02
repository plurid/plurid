import {
    TreePage,
    PluridConfiguration,
    PluridView,
    PluridCluster,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from './logic';



export interface TreeData {
    pages: TreePage[],
    clusters?: PluridCluster[],
    configuration?: PluridConfiguration,
    view?: string[] | PluridView[],
    previousTree?: TreePage[],
}

export default class Tree {
    private data: TreeData;

    constructor(
        data: TreeData,
    ) {
        this.data = data;
    }

    public compute() {
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
