import { getTransformRotate } from "../logic/transforms-core.js";
import { capitalize } from "../core/utils";


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
                    &#x25c0;
                </div>
            </div>

            <div class="plurid-viewcube-controls plurid-viewcube-rotate-right-container">
                <div class="plurid-viewcube-button">
                    &#x25b6;
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


export function rotateViewcube(event, plurid) {
    let rotateX = getTransformRotate(plurid).rotateX;
    let rotateY = getTransformRotate(plurid).rotateY;
    let rotateYdeg = rotateY * 180 / Math.PI;

    let viewCube = document.getElementsByClassName('plurid-viewcube-model-transform-cube')[0];

    viewCube.style.transform = `translateX(23px) translateY(16px) rotateY(${rotateYdeg}deg)`;

    // console.log(viewCube);
    // console.log(rotateYdeg);
}


function setModelZoneButtons(buttons, pair) {
    buttons.map(button => {
        button.addEventListener('mouseover', () => {
            buttons.map(button => button.classList.add('plurid-viewcube-model-transform-face-zone-active') );
        });
        button.addEventListener('mouseout', () => {
            buttons.map(button => button.classList.remove('plurid-viewcube-model-transform-face-zone-active') );
        });

        button.addEventListener('click', () => {

            // switch (pair[0]) {
            //     case 'front-middle-left':
            //         console.log('A');
            //         break;

            //     default:
            //         console.log('Nothing');
            //         break;
            // }
            console.log(button, '\n', pair);
        })
    });
}


export function initViewcubeModelButtons(container) {
    let faces = ['front', 'left', 'back', 'right', 'top', 'base'];
    let rows = ['top', 'middle', 'bottom'];
    let columns = ['left', 'center', 'right'];

    let buttons = {};
    let forPairing = {};

    faces.map(face => {
        rows.map(row => {
            columns.map(column => {
                const key = face + capitalize(row) + capitalize(column);
                const selectClass = `${face}-${row}-${column}`;
                const buttonClass = `plurid-viewcube-model-transform-${selectClass}`;
                buttons[key] = container.getElementsByClassName(buttonClass)[0];
                forPairing[key] = selectClass;
            });
        });
    });


    // Index of pairs and zoneButtons must remain in a one-to-one correpondence.
    const pairs = [
        forPairing.frontMiddleCenter,
        forPairing.leftMiddleCenter,
        forPairing.backMiddleCenter,
        forPairing.rightMiddleCenter,
        forPairing.topMiddleCenter,
        forPairing.baseMiddleCenter,

        forPairing.frontMiddleLeft,
        forPairing.leftMiddleLeft,
        forPairing.backMiddleLeft,
        forPairing.rightMiddleLeft,

        forPairing.frontTopCenter,
        forPairing.frontBottomCenter,
        forPairing.leftTopCenter,
        forPairing.leftBottomCenter,
        forPairing.backTopCenter,
        forPairing.backBottomCenter,
        forPairing.rightTopCenter,
        forPairing.rightBottomCenter,

        forPairing.frontTopLeft,
        forPairing.leftTopLeft,
        forPairing.backTopLeft,
        forPairing.rightTopLeft,

        forPairing.frontBottomLeft,
        forPairing.leftBottomLeft,
        forPairing.backBottomLeft,
        forPairing.rightBottomLeft
    ];

    const zoneButtons = [
        [buttons.frontMiddleCenter],
        [buttons.leftMiddleCenter],
        [buttons.backMiddleCenter],
        [buttons.rightMiddleCenter],
        [buttons.topMiddleCenter],
        [buttons.baseMiddleCenter],

        [buttons.frontMiddleLeft, buttons.leftMiddleRight],
        [buttons.leftMiddleLeft, buttons.backMiddleRight],
        [buttons.backMiddleLeft, buttons.rightMiddleRight],
        [buttons.rightMiddleLeft, buttons.frontMiddleRight],

        [buttons.frontTopCenter, buttons.topBottomCenter],
        [buttons.frontBottomCenter, buttons.baseTopCenter],
        [buttons.leftTopCenter, buttons.topMiddleLeft],
        [buttons.leftBottomCenter, buttons.baseMiddleLeft],
        [buttons.backTopCenter, buttons.topTopCenter],
        [buttons.backBottomCenter, buttons.baseBottomCenter],
        [buttons.rightTopCenter, buttons.topMiddleRight],
        [buttons.rightBottomCenter, buttons.baseMiddleRight],

        [buttons.frontTopLeft, buttons.leftTopRight, buttons.topBottomLeft],
        [buttons.leftTopLeft, buttons.backTopRight, buttons.topTopLeft],
        [buttons.backTopLeft, buttons.rightTopRight, buttons.topTopRight],
        [buttons.rightTopLeft, buttons.frontTopRight, buttons.topBottomRight],

        [buttons.frontBottomLeft, buttons.leftBottomRight, buttons.baseTopLeft],
        [buttons.leftBottomLeft, buttons.backBottomRight, buttons.baseBottomLeft],
        [buttons.backBottomLeft, buttons.rightBottomRight, buttons.baseBottomRight],
        [buttons.rightBottomLeft, buttons.frontBottomRight, buttons.baseTopRight]
    ];

    zoneButtons.map((buttons, index) => {
        setModelZoneButtons(buttons, pairs[index]);
    });
}
