// #region imports
    // #region libraries
    import {
        TreePlane,
        RegisteredPluridPlane,
        PluridConfiguration,
        PluridApplicationView,
        ViewSize,
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
    /** The tree being replaced: its roots' measured / hand-set sizes place the new roots (the sizing contract). */
    previousTree?: TreePlane[];
    /** The measured view the layouts space planes by (falls back to the window / an SSR default). */
    viewSize?: ViewSize;
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
            viewSize,
            previousTree,
        } = this.data;

        return computeSpaceTree(
            planes,
            view,
            configuration,
            layout,
            this.origin,
            this.getCount.bind(this),
            viewSize,
            previousTree,
        );
    }


    private getCount() {
        return this.count++;
    }
}
// #endregion module
