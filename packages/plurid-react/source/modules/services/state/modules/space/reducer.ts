import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.SET_SPACE_LOADING:
            return resolvers.setSpaceLoading(state, action);
        case Types.SET_ANIMATED_TRANSFORM:
            return resolvers.setAnimatedTransform(state, action);
        case Types.SET_SPACE_LOCATION:
            return resolvers.setSpaceLocation(state, action);

        case Types.VIEW_CAMERA_MOVE_FORWARD:
            return resolvers.viewCameraMoveForward(state);
        case Types.VIEW_CAMERA_MOVE_BACKWARD:
            return resolvers.viewCameraMoveBackward(state);
        case Types.VIEW_CAMERA_MOVE_LEFT:
            return resolvers.viewCameraMoveLeft(state);
        case Types.VIEW_CAMERA_MOVE_RIGHT:
            return resolvers.viewCameraMoveRight(state);
        case Types.VIEW_CAMERA_MOVE_UP:
            return resolvers.viewCameraMoveUp(state);
        case Types.VIEW_CAMERA_MOVE_DOWN:
            return resolvers.viewCameraMoveDown(state);

        case Types.VIEW_CAMERA_TURN_UP:
            return resolvers.viewCameraTurnUp(state);
        case Types.VIEW_CAMERA_TURN_DOWN:
            return resolvers.viewCameraTurnDown(state);
        case Types.VIEW_CAMERA_TURN_LEFT:
            return resolvers.viewCameraTurnLeft(state);
        case Types.VIEW_CAMERA_TURN_RIGHT:
            return resolvers.viewCameraTurnRight(state);

        case Types.ROTATE_UP:
            return resolvers.rotateUp(state);
        case Types.ROTATE_DOWN:
            return resolvers.rotateDown(state);
        case Types.ROTATE_X:
            return resolvers.rotateX(state, action);
        case Types.ROTATE_X_WITH:
            return resolvers.rotateXWith(state, action);
        case Types.ROTATE_LEFT:
            return resolvers.rotateLeft(state);
        case Types.ROTATE_RIGHT:
            return resolvers.rotateRight(state);
        case Types.ROTATE_Y:
            return resolvers.rotateY(state, action);
        case Types.ROTATE_Y_WITH:
            return resolvers.rotateYWith(state, action);

        case Types.TRANSLATE_UP:
            return resolvers.translateUp(state);
        case Types.TRANSLATE_DOWN:
            return resolvers.translateDown(state);
        case Types.TRANSLATE_LEFT:
            return resolvers.translateLeft(state);
        case Types.TRANSLATE_RIGHT:
            return resolvers.translateRight(state);
        case Types.TRANSLATE_IN:
            return resolvers.translateIn(state);
        case Types.TRANSLATE_OUT:
            return resolvers.translateOut(state);
        case Types.TRANSLATE_X_WITH:
            return resolvers.translateXWith(state, action);
        case Types.TRANSLATE_Y_WITH:
            return resolvers.translateYWith(state, action);

        case Types.SCALE_UP:
            return resolvers.scaleUp(state);
        case Types.SCALE_DOWN:
            return resolvers.scaleDown(state);
        case Types.SCALE_UP_WITH:
            return resolvers.scaleUpWith(state, action);
        case Types.SCALE_DOWN_WITH:
            return resolvers.scaleDownWith(state, action);

        case Types.SET_TREE:
            return resolvers.setTree(state, action);
        case Types.SET_ACTIVE_DOCUMENT:
            return resolvers.setActiveDocument(state, action);
        case Types.SPACE_RESET_TRANSFORM:
            return resolvers.spaceResetTransform(state);
        case Types.SET_VIEW_SIZE:
            return resolvers.setViewSize(state, action);
        case Types.SET_SPACE_SIZE:
            return resolvers.setSpaceSize(state, action);
        case Types.UPDATE_SPACE_TREE_PAGE:
            return resolvers.updateSpaceTreePage(state, action);
        case Types.UPDATE_SPACE_LINK_COORDINATES:
            return resolvers.updateSpaceLinkCoordinates(state, action);

        case Types.SPACE_SET_VIEW:
            return resolvers.spaceSetView(state, action);

        default:
            return {
                ...state,
            };
    }
}


export default reducer;
