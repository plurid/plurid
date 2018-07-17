import { getTransformRotate } from "../logic/transforms-core.js";



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
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Front
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-left">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Left
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-back">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Back
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-right">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Right
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-top">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Top
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
                        </div>

                        <div class="plurid-viewcube-model-transform-face plurid-viewcube-model-transform-base">
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-top-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-center">
                                <div class="plurid-viewcube-model-transform-face-text">
                                    Base
                                </div>
                            </div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-middle-right"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-left"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-center"></div>
                            <div class="plurid-viewcube-model-transform-face-zone plurid-viewcube-model-transform-bottom-right"></div>
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
