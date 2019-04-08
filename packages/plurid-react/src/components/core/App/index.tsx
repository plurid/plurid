import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PluridContainer from '../Container';
import PluridSheet from '../Sheet';
import {
    getWheelDirection,
    rotatePlurid,
    translatePlurid,
    scalePlurid,
} from 'plurid-engine';

import { PluridContext } from '../context';



export interface IPluridAppProps {
    theme?: string;
}

export interface IPluridAppState {
    context?: any;
}

enum DirectionArrow {
    Up = "ArrowUp",
    Down = "ArrowDown",
    Left = "ArrowLeft",
    Right = "ArrowRight",
}


const IDENTITY_MATRIX = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
// const DIRECTION_ABSTHRESHOLD = 10;
// const DIRECTION_THRESHOLD = 0;
const ANGLE_INCREMENT = 0.05;


class PluridApp extends Component<IPluridAppProps, IPluridAppState> {
    public static propTypes = {
        theme: PropTypes.string,
    }

    public static contextType = PluridContext;

    constructor(props: any) {
        super(props);

        this.state = {
            context: {
                roots: {
                    matrix3d: IDENTITY_MATRIX,
                    // matrix3d: 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)',
                }
            }
        }
    }

    public setRootsMatrix3d = (matrix3d: string) => {
        const roots = {...this.state.context.roots};
        roots.matrix3d = matrix3d;
        const context = {...this.state.context};
        context.roots = roots;
        this.setState({
            context
        });
    }

    public onWheel = (event: any) => {
        event.preventDefault();

        if (event.shiftKey) {
            // console.log('rotate');
            const deltas = {
                deltaX: event.deltaX,
                deltaY: event.deltaY
            }
            const matrix3d = this.state.context.roots.matrix3d;
            const direction = getWheelDirection(deltas);
            const transformedMatrix3d = rotatePlurid(matrix3d, direction, ANGLE_INCREMENT);
            this.transformPluridRoots(transformedMatrix3d);
        }

        if (event.altKey ) {
            // console.log('translate');
            const deltas = {
                deltaX: event.deltaX,
                deltaY: event.deltaY
            }
            const matrix3d = this.state.context.roots.matrix3d;
            const direction = getWheelDirection(deltas);
            const transformedMatrix3d = translatePlurid(matrix3d, direction);
            this.transformPluridRoots(transformedMatrix3d);
        }

        if (event.ctrlKey || event.metaKey ) {
            // console.log('scale');
            const deltas = {
                deltaX: event.deltaX,
                deltaY: event.deltaY
            }
            const matrix3d = this.state.context.roots.matrix3d;
            const direction = getWheelDirection(deltas);
            const transformedMatrix3d = scalePlurid(matrix3d, direction);
            this.transformPluridRoots(transformedMatrix3d);
        }
    }

    public onKeyDown = (event: any) => {
        const whichKey = event.which;
        const key = event.key;
        // console.log(event.key);
        // console.log(event.which);

        // ROTATE
        if (event.shiftKey && key === DirectionArrow.Left) {
            console.log("Rotate Left");
            event.preventDefault();
        }

        // Shift + arrow-right
        if (event.shiftKey && whichKey === 39) {
            console.log("Rotate Right");
            event.preventDefault();
        }


        // Shift + arrow-up
        if (event.shiftKey && whichKey === 38) {
            console.log("Rotate Up");
            event.preventDefault();
        }

        // Shift + arrow-down
        if (event.shiftKey && whichKey === 40) {
            console.log("Rotate Down");
            event.preventDefault();
        }


        // TRANSLATE
        // Alt/Opt + arrow-left
        if (event.altKey && whichKey === 37) {
            console.log("Translate Left");
            event.preventDefault();
        }

        // Alt/Opt + arrow-right
        if (event.altKey && whichKey === 39) {
            console.log("Translate Right");
            event.preventDefault();
        }

        // Alt/Opt + arrow-up
        if (event.altKey && whichKey === 38) {
            console.log("Translate Up");
            event.preventDefault();
        }

        // Alt/Opt + arrow-down
        if (event.altKey && whichKey === 40) {
            console.log("Translate Down");
            event.preventDefault();
        }


        // SCALE
        // Cltr/Cmd + arrow-up
        if ((event.metaKey || event.ctrlKey) && whichKey === 38) {
            console.log("Scale Up");
            event.preventDefault();
        }

        // Cltr/Cmd + arrow-down
        if ((event.metaKey || event.ctrlKey) && whichKey === 40) {
            console.log("Scale Down");
            event.preventDefault();
        }
    }

    public render() {
        // console.log(this.state.context.roots.matrix3d);
        const { children } = this.props;

        const sheetChildren = React.Children.map(children, child => {
            const sheetChild = (
                <PluridSheet>
                    {(child as any).props.children}
                </PluridSheet>
            );
            return sheetChild;
        });
        // console.log('sheetChildren', sheetChildren);

        return (
            <PluridContext.Provider value={this.state.context}>
                <PluridContainer
                    onWheel={this.onWheel}
                    onKeyDown={this.onKeyDown}
                >
                    {sheetChildren}
                </PluridContainer>
            </PluridContext.Provider>
        );
    }

    private transformPluridRoots = (matrix3d: string) => {
        const roots = {...this.state.context.roots};
        roots.matrix3d = matrix3d;
        const context = {...this.state.context};
        context.roots = roots;
        this.setState({context});
    }
}

export default PluridApp;
