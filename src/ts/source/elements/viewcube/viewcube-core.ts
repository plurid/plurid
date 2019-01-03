import * as matrix from "../../core/logic/matrix";
import { getTransformRotate } from "../../core/logic/transforms-core";
import * as transcore from "../../core/logic/transforms-core";
import { capitalize } from "../../core/utils/simple";



export function renderViewcube(container) {
    const viewcube = document.createElement("plurid-viewcube");
    container.appendChild(viewcube);
}


export function contentViewcube(container) {
    return `
        <div class="plurid-viewcube-container">
            <div class="plurid-viewcube-controls plurid-viewcube-scale-container">
                <input type="range">
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-rotate-left-container">
                <div class="plurid-viewcube-button">
                    &#x25c0&#xFE0E;
                </div>
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-rotate-right-container">
                <div class="plurid-viewcube-button">
                    &#x25b6&#xFE0E;
                </div>
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-rotate-up-container">
                <div class="plurid-viewcube-button">
                    &#x25B2;
                </div>
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-rotate-down-container">
                <div class="plurid-viewcube-button">
                    &#x25BC;
                </div>
            </div>

            <div class="plurid-viewcube-model-container">
                <div class="plurid-viewcube-model-transform-container">
                    <div class="plurid-viewcube-model-transform-cube">
                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-front">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-front-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-front-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-front-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-front-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-front-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Front
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-front-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-front-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-front-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-front-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-left">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-left-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-left-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-left-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-left-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-left-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Left
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-left-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-left-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-left-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-left-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-back">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-back-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-back-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-back-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-back-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-back-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Back
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-back-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-back-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-back-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-back-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-right">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-right-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-right-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-right-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-right-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-right-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Right
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-right-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-right-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-right-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-right-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-top">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-top-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-top-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-top-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-top-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-top-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Top
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-top-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-top-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-top-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-top-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-base">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left plurid-viewcube-model-transform-base-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center plurid-viewcube-model-transform-base-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right plurid-viewcube-model-transform-base-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left plurid-viewcube-model-transform-base-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center plurid-viewcube-model-transform-base-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Base
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right plurid-viewcube-model-transform-base-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left plurid-viewcube-model-transform-base-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center plurid-viewcube-model-transform-base-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right plurid-viewcube-model-transform-base-bottom-right"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-translate-y-container">
                <input type="range" orient="vertical">
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-translate-x-container">
                <input type="range">
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-fitview-container">
                <div class="plurid-viewcube-button">
                    &#8281;
                </div>
            </div>
        </div>
    `;
}


export function rotateViewcube(event, plurid, rotateX, rotateY) {
    // let rotateX = getTransformRotate(plurid).rotateX;
    // let rotateY = getTransformRotate(plurid).rotateY;
    // let rotateXdeg = rotateX * 180 / Math.PI;
    // let rotateYdeg = rotateY * 180 / Math.PI;
    if (previousButtons) {
        for (const previousButton of previousButtons) {
            previousButton.classList.remove('plurid-viewcube-model-transform-face-selected');
        }
    }

    const viewCube = document.getElementsByClassName('plurid-viewcube-model-transform-cube')[0];

    // viewCube.style.transform = `translateX(32px) translateY(23px) rotateX(${rotateXdeg}deg) rotateY(${rotateYdeg}deg)`;
    (<any> viewCube).style.transform = `translateX(32px) translateY(23px) rotateX(${-1 * rotateX}deg) rotateY(${-1 * rotateY}deg)`;
}


function setModelZoneButtons(buttons, viewZone) {

    const viewZoneSwitch = (_viewZone) => ({
        'front-middle-center': { rotateX: 0, rotateY: 0 },
        'front-top-left': { rotateX: -45, rotateY: 45 },
        'front-top-center': { rotateX: -45, rotateY: 0 },
        'right-top-left': { rotateX: -45, rotateY: -45 },
        'front-middle-left': { rotateX: 0, rotateY: 45 },
        'right-middle-left': { rotateX: 0, rotateY: 315 },
        'front-bottom-left': { rotateX: 45, rotateY: 45 },
        'front-bottom-center': { rotateX: 45, rotateY: 0 },
        'right-bottom-left': { rotateX: 45, rotateY: -45 },
        'left-middle-center': { rotateX: 0, rotateY: 90 },
        'left-top-left': { rotateX: -45, rotateY: 135 },
        'left-top-center': { rotateX: -45, rotateY: 90 },
        'left-middle-left': { rotateX: 0, rotateY: 135 },
        'left-bottom-left': { rotateX: 45, rotateY: 135 },
        'left-bottom-center': { rotateX: 45, rotateY: 90 },
        'back-middle-center': { rotateX: 0, rotateY: 180 },
        'back-top-left': { rotateX: -45, rotateY: 225 },
        'back-top-center': { rotateX: -45, rotateY: 180 },
        'back-middle-left': { rotateX: 0, rotateY: 225 },
        'back-bottom-left': { rotateX: 45, rotateY: 225 },
        'back-bottom-center': { rotateX: 45, rotateY: 180 },
        'right-middle-center': { rotateX: 0, rotateY: 270 },
        'right-top-center': { rotateX: -45, rotateY: 270 },
        'right-bottom-center': { rotateX: 45, rotateY: 270 },
        'top-middle-center': { rotateX: -90, rotateY: 0 },
        'base-middle-center': { rotateX: 90, rotateY: 0 },
    })[_viewZone];

    function position(transform) {
        const pluridRoots = document.getElementsByTagName('plurid-roots')[0];
        const viewCube = document.getElementsByClassName('plurid-viewcube-model-transform-cube')[0];

        const rotationDeviation = 0.06;
        const rotateX = transform.rotateX + rotationDeviation;
        const rotateY = transform.rotateY + rotationDeviation;

        const translateX = transcore.getTransformTranslate(pluridRoots).translateX;
        const translateY = transcore.getTransformTranslate(pluridRoots).translateY;
        const translateZ = 0;
        const scale = transcore.getTransformScale(pluridRoots).scale;

        const valRotationMatrix = matrix.rotateMatrix(-1 * rotateX, -1 * rotateY);
        // const valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);
        // const valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);

        const valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
        const valscaleMatrix = matrix.scaleMatrix(scale);

        const yPos = transcore.getyPos(null, pluridRoots);

        // transform = transform <= 180 ? transform : transform + 360;

        // const rotateY = getTransformRotate(viewCube).rotateY;
        // const rotateYdeg = rotateY * 180 / Math.PI;
        // const angle = (rotateY + transform) <= 180 ? transform : 360 + transform;

        // console.log('rotateYdeg', rotateYdeg);
        // console.log('transform', transform);
        // console.log('angle', angle);

        (<any> pluridRoots).style.transition = "transform 300ms";
        transcore.setTransform(pluridRoots, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);

        (<any> viewCube).style.transition = "transform 300ms";

        if (rotateX !== 0) {
            (<any> viewCube).style.transform = `translateX(32px) translateY(23px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        } else {
            (<any> viewCube).style.transform = `translateX(32px) translateY(23px) rotateY(${rotateY}deg)`;
        }

        setTimeout(() => {
            (<any> viewCube).style.transition = "";
            (<any> pluridRoots).style.transition = "";
        }, 300);

        // function rotateThis(el, nR) {
        //     rot = rot || 0; // if rot undefined or 0, make 0, else rot
        //     let aR = rot % 360;
        //     if ( aR < 0 ) { aR += 360; }
        //     if ( aR < 180 && (nR > (aR + 180)) ) { rot -= 360; }
        //     if ( aR >= 180 && (nR <= (aR - 180)) ) { rot += 360; }
        //     rot += (nR - aR);
        //     // element.style.transform = ("rotate( " + rot + "deg )");
        //     el.style.transition = "transform 300ms";
        //     el.style.transform = `translateX(23px) translateY(16px) rotateY(${rot}deg)`;
        //     setTimeout(() => {
        //         el.style.transition = "";
        //     }, 300);
        // }

        // rotateThis(viewCube, transform);
        // console.log(transform);
        console.log(previousButtons);
        if (previousButtons) {
            for (const previousButton of previousButtons) {
                previousButton.classList.remove('plurid-viewcube-model-transform-face-selected');
            }
        }

        for (const button of buttons) {
            button.classList.add('plurid-viewcube-model-transform-face-selected');
        }

        previousButtons = buttons;
    }

    buttons.map( (button) => {
        button.addEventListener('mouseover', () => {
            buttons.map( (btn) => btn.classList.add('plurid-viewcube-model-transform-face-zone-active') );
        });
        button.addEventListener('mouseout', () => {
            buttons.map( (btn) => btn.classList.remove('plurid-viewcube-model-transform-face-zone-active') );
        });

        button.addEventListener('click', () => {
            position(viewZoneSwitch(viewZone));
        });
    });
}

let previousButtons;


export function initViewcubeModelButtons(container) {
    const faces = ['front', 'left', 'back', 'right', 'top', 'base'];
    const rows = ['top', 'middle', 'bottom'];
    const columns = ['left', 'center', 'right'];

    const buttons = {};
    const viewZones = {};

    faces.map((face) => {
        rows.map((row) => {
            columns.map((column) => {
                const key = face + capitalize(row) + capitalize(column);
                const selectClass = `${face}-${row}-${column}`;
                const buttonClass = `plurid-viewcube-model-transform-${selectClass}`;
                buttons[key] = container.getElementsByClassName(buttonClass)[0];
                viewZones[key] = selectClass;
            });
        });
    });


    // Index of viewZone and zoneButtons must remain in a one-to-one correpondence.
    const viewZone = [
        (<any> viewZones).frontMiddleCenter,
        (<any> viewZones).leftMiddleCenter,
        (<any> viewZones).backMiddleCenter,
        (<any> viewZones).rightMiddleCenter,
        (<any> viewZones).topMiddleCenter,
        (<any> viewZones).baseMiddleCenter,

        (<any> viewZones).frontMiddleLeft,
        (<any> viewZones).leftMiddleLeft,
        (<any> viewZones).backMiddleLeft,
        (<any> viewZones).rightMiddleLeft,

        (<any> viewZones).frontTopCenter,
        (<any> viewZones).frontBottomCenter,
        (<any> viewZones).leftTopCenter,
        (<any> viewZones).leftBottomCenter,
        (<any> viewZones).backTopCenter,
        (<any> viewZones).backBottomCenter,
        (<any> viewZones).rightTopCenter,
        (<any> viewZones).rightBottomCenter,

        (<any> viewZones).frontTopLeft,
        (<any> viewZones).leftTopLeft,
        (<any> viewZones).backTopLeft,
        (<any> viewZones).rightTopLeft,

        (<any> viewZones).frontBottomLeft,
        (<any> viewZones).leftBottomLeft,
        (<any> viewZones).backBottomLeft,
        (<any> viewZones).rightBottomLeft,
    ];

    const zoneButtons = [
        [(<any> buttons).frontMiddleCenter],
        [(<any> buttons).leftMiddleCenter],
        [(<any> buttons).backMiddleCenter],
        [(<any> buttons).rightMiddleCenter],
        [(<any> buttons).topMiddleCenter],
        [(<any> buttons).baseMiddleCenter],

        [(<any> buttons).frontMiddleLeft, (<any> buttons).leftMiddleRight],
        [(<any> buttons).leftMiddleLeft, (<any> buttons).backMiddleRight],
        [(<any> buttons).backMiddleLeft, (<any> buttons).rightMiddleRight],
        [(<any> buttons).rightMiddleLeft, (<any> buttons).frontMiddleRight],

        [(<any> buttons).frontTopCenter, (<any> buttons).topBottomCenter],
        [(<any> buttons).frontBottomCenter, (<any> buttons).baseTopCenter],
        [(<any> buttons).leftTopCenter, (<any> buttons).topMiddleLeft],
        [(<any> buttons).leftBottomCenter, (<any> buttons).baseMiddleLeft],
        [(<any> buttons).backTopCenter, (<any> buttons).topTopCenter],
        [(<any> buttons).backBottomCenter, (<any> buttons).baseBottomCenter],
        [(<any> buttons).rightTopCenter, (<any> buttons).topMiddleRight],
        [(<any> buttons).rightBottomCenter, (<any> buttons).baseMiddleRight],

        [(<any> buttons).frontTopLeft, (<any> buttons).leftTopRight, (<any> buttons).topBottomLeft],
        [(<any> buttons).leftTopLeft, (<any> buttons).backTopRight, (<any> buttons).topTopLeft],
        [(<any> buttons).backTopLeft, (<any> buttons).rightTopRight, (<any> buttons).topTopRight],
        [(<any> buttons).rightTopLeft, (<any> buttons).frontTopRight, (<any> buttons).topBottomRight],

        [(<any> buttons).frontBottomLeft, (<any> buttons).leftBottomRight, (<any> buttons).baseTopLeft],
        [(<any> buttons).leftBottomLeft, (<any> buttons).backBottomRight, (<any> buttons).baseBottomLeft],
        [(<any> buttons).backBottomLeft, (<any> buttons).rightBottomRight, (<any> buttons).baseBottomRight],
        [(<any> buttons).rightBottomLeft, (<any> buttons).frontBottomRight, (<any> buttons).baseTopRight]
    ];

    zoneButtons.map((_buttons, index) => {
        setModelZoneButtons(_buttons, viewZone[index]);
    });
}
