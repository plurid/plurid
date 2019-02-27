import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PluridContainer from '../Container';
import PluridSheet from '../Sheet';

import { PluridContext } from '../context';

export interface IPluridAppProps {
    theme?: string;
}

export interface IPluridAppState {
    context?: object;
}

enum DirectionArrow {
    Up = "ArrowUp",
    Down = "ArrowDown",
    Left = "ArrowLeft",
    Right = "ArrowRight",
}

const ROTATE_STEP = 4.1;
const THRESHOLD = 0;
const ABSTHRESHOLD = 10;

class PluridApp extends Component<IPluridAppProps, IPluridAppState> {
    public static propTypes = {
        theme: PropTypes.string,
    }

    public static contextType = PluridContext;

    public state = {
        context: {
            roots: {
                rotX: 20,
                rotY: 30,
                rotZ: 0,
                transX: 0,
                transY: 0,
                transZ: 0,
            }
        }
    }

    public onWheel = (event: any) => {
        event.preventDefault();

        if (event.shiftKey) {
            // console.log('rotate');
            const direction = this.getDirection(event);
            this.rotate(direction);
        }

        if (event.ctrlKey || event.metaKey ) {
            console.log('scale');
        }

        if (event.altKey ) {
            console.log('translate');
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

    private rotate = (direction: string) => {
        const roots = {...this.state.context.roots};

        if (direction === 'left') {
            roots.rotY = this.state.context.roots.rotY + ROTATE_STEP;
        }
        if (direction === 'right') {
            roots.rotY = this.state.context.roots.rotY - ROTATE_STEP;
        }

        if (direction === 'up') {
            roots.rotX = this.state.context.roots.rotX + ROTATE_STEP;
        }
        if (direction === 'down') {
            roots.rotX = this.state.context.roots.rotX - ROTATE_STEP;
        }

        const context = {...this.state.context};
        context.roots = roots;
        this.setState({context});
    }

    private getDirection = (event: any): string => {
        let direction = 'left';
        const wheelDeltaX = event.deltaX;
        const wheelDeltaY = event.deltaY;
        // console.log('wheelDeltaX', wheelDeltaX);
        // console.log('wheelDeltaY', wheelDeltaY);
        const absWheelDeltaX = Math.abs(wheelDeltaX);
        const absWheelDeltaY = Math.abs(wheelDeltaY);
        // console.log('absWheelDeltaX', absWheelDeltaX);
        // console.log('absWheelDeltaY', absWheelDeltaY);

        if (wheelDeltaX > THRESHOLD
            && absWheelDeltaY < ABSTHRESHOLD
            && absWheelDeltaX > absWheelDeltaY) {
            direction = "left";
        }

        if (wheelDeltaX < THRESHOLD
            && absWheelDeltaY < ABSTHRESHOLD
            && absWheelDeltaX > absWheelDeltaY) {
            direction = "right";
        }

        if (wheelDeltaY > THRESHOLD
            && absWheelDeltaX < ABSTHRESHOLD
            && absWheelDeltaY > absWheelDeltaX) {
            direction = "up";
        }

        if (wheelDeltaY < THRESHOLD
            && absWheelDeltaX < ABSTHRESHOLD
            && absWheelDeltaY > absWheelDeltaX) {
            direction = "down";
        }

        return direction;
    }
}

export default PluridApp;
