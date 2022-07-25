// #region imports
    // #region libraries
    import { AnyAction } from 'redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        computePlaneLocation,
    } from '../computing';
    // #endregion external
// #endregion imports



// #region module
export const navigateToPluridPlane = (
    event: React.MouseEvent | undefined,
    plane: TreePlane | undefined,
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
) => {
    if (event && (event.altKey || event.metaKey)) {
        // Only navigate at pure link click.
        return;
    }

    if (!plane) {
        return;
    }


    const dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform = (
        payload,
    ) => dispatch(
        actions.space.setAnimatedTransform(payload),
    );
    const dispatchSetTransform: typeof actions.space.setTransform = (
        payload,
    ) => dispatch(
        actions.space.setTransform(payload),
    );
    const dispatchSetSpaceField: typeof actions.space.setSpaceField = (
        payload,
    ) => dispatch(
        actions.space.setSpaceField(payload),
    );


    const {
        matrix3d,
        transform,
    } = computePlaneLocation(plane);

    dispatchSetAnimatedTransform(true);

    dispatchSetSpaceField({
        field: 'transform',
        value: matrix3d,
    });

    dispatchSetTransform({
        ...transform,
    });

    setTimeout(() => {
        dispatchSetAnimatedTransform(false);
    }, 500);
}
// #endregion module
