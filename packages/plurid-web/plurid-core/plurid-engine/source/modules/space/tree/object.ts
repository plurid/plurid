// #region imports
    // #region libraries
    import {
        TreePlane,
        RegisteredPluridPlane,
        PluridConfiguration,
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        computeSpaceTree,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export interface TreeData<C> {
    planes: Map<string, RegisteredPluridPlane<C>>;
    view: PluridApplicationView;
    configuration: PluridConfiguration;
    layout?: boolean;
    previousTree?: TreePlane[];
}

export default class Tree<C> {
    private data: TreeData<C>;
    private origin: string;
    private count = 0;


    constructor(
        data: TreeData<C>,
        origin: string = 'origin',
    ) {
        this.data = data;
        this.origin = origin;
    }


    public compute() {
        const {
            planes,
            view,
            configuration,
            layout,
        } = this.data;

        return computeSpaceTree(
            planes,
            view,
            configuration,
            layout,
            this.origin,
            this.getCount.bind(this),
        );
    }


    private getCount() {
        return this.count++;
    }
}
// #endregion module
