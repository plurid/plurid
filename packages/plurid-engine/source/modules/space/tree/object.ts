import {
    TreePlane,
    PluridConfiguration,
    PluridView,
    PluridCluster,
} from '@plurid/plurid-data';

import {
    computeSpaceTree,
} from './logic';



export interface TreeData {
    pages: TreePlane[],
    clusters?: PluridCluster[],
    configuration?: PluridConfiguration,
    view?: string[] | PluridView[],
    previousTree?: TreePlane[],
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
