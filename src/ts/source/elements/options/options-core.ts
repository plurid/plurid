import * as plurid from "../../core/logic/transforms";



export function renderOptions(element) {
    const options = document.createElement("plurid-options");
    element.appendChild(options);
}


export function displayOptions(element) {
    // element.addEventListener("mousemove", event => {
    //     function pathContains(element, path) {
    //         let contains = false;
    //         path.map(el => { el.nodeName === element ? contains = true : ''; });
    //         return contains;
    //     }

    //     // cross-browsers eventPath
    //     let eventPath = event.path || (event.composedPath && event.composedPath());

    //     let containsOptions = pathContains('PLURID-OPTIONS', eventPath);

    //     let cursorYLocation = event.pageY;
    //     let containerHeight = element.clientHeight;
    //     let optionsDisplayLimitOn = 80;
    //     let optionsDisplayLimitOff = 80;
    //     let optionsTag = element.getElementsByTagName("plurid-options")[0];

    //     if (cursorYLocation > (containerHeight - optionsDisplayLimitOn)) {
    //         optionsTag.style.display = "block";
    //     }

    //     if (cursorYLocation < (containerHeight - optionsDisplayLimitOff) && !containsOptions){
    //         optionsTag.style.display = "none";
    //     }
    // });
}


export function contentOptions() {
    let content = ` <div class="plurid-container-options-container">
                        <div class="plurid-container-options-content">
                            <div class="plurid-container-options-group">
                                <div class="plurid-button plurid-button-icon plurid-container-rotate-left">
                                    &#x25c0&#xFE0E;
                                </div>

                                <span class="plurid-button plurid-button-icon plurid-container-rotate-up">&#x25B2;</span>
                                <p>Rotation</p>
                                <span class="plurid-button plurid-button-icon plurid-container-rotate-down">&#x25BC;</span>
                                <span class="plurid-button plurid-button-icon plurid-container-rotate-right">&#x25b6&#xFE0E;</span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon plurid-container-translate-left">&#x25c0&#xFE0E;</span>
                                <span class="plurid-button plurid-button-icon plurid-container-translate-up">&#x25B2;</span>
                                <p>Translation</p>
                                <span class="plurid-button plurid-button-icon plurid-container-translate-down">&#x25BC;</span>
                                <span class="plurid-button plurid-button-icon plurid-container-translate-right">&#x25b6&#xFE0E;</span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon  plurid-container-scale-up">&#x25B2;</span>
                                <p>Scale</p>
                                <span class="plurid-button plurid-button-icon  plurid-container-scale-down">&#x25BC;</span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon plurid-container-button-center-everything">
                                    &#8281;
                                </span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon plurid-container-button-add-root">
                                    &#10746;
                                </span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon plurid-container-button-gyroscope">
                                    G
                                </span>
                            </div>

                            <div class="plurid-container-options-group">
                                <span class="plurid-button plurid-button-icon plurid-container-button-more">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 622.51 130.1"><defs></defs><title>More</title><g id="Layer_2" data-name="Layer 2"><g id="More"><rect class="plurid-button-icon-svg" x="20.2" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M130.1,130.1H0V0H130.1ZM40.4,89.69H89.69V40.4H40.4Z"/><rect class="plurid-button-icon-svg" x="266.21" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M376.11,130.1H246V0h130.1Zm-89.7-40.41H335.7V40.4H286.41Z"/><rect class="plurid-button-icon-svg" x="512.62" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M622.51,130.1H492.42V0H622.51ZM532.82,89.69h49.29V40.4H532.82Z"/></g></g></svg>
                                </span>
                            </div>

                            <div class="plurid-container-options-more">
                                <div class="plurid-container-options-more-group-transforms">
                                    <div class="plurid-button">
                                        <!-- <label class="plurid-container-options-group-more plurid-controls-more-checkmark-container">
                                            <span class="plurid-controls-more-container-text">
                                                Lock Rotation X
                                            </span>
                                            <span class="plurid-controls-more-container-shortcut">
                                                <input type="checkbox">
                                                <span class="plurid-controls-more-checkmark"></span>
                                            </span>
                                        </label> -->
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-lock-rotation-x">
                                        <p>Lock Rotation X</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-lock-rotation-y">
                                        <p>Lock Rotation Y</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-scroll-translate">
                                        <p>Use Scroll to Translate</p>
                                        <input type="checkbox" class="plurid-container-use-scroll">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-lock-translation-x">
                                        <p>Lock Translation X</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-lock-translation-y">
                                        <p>Lock Translation Y</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-transform-sensitivity">
                                        <p>Transform Sensitivity</p>
                                        <input type="text">
                                        <input type="range">
                                    </div>
                                </div>

                                <hr>

                                <div class="plurid-container-options-more-group-colors">
                                    <div class="plurid-container-options-group-more plurid-container-more-container-background">
                                        <p>Container Background</p>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-container-background-gradient">
                                        <p>Radial Background Gradient (performance intensive)</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-general-theme">
                                        <p>General Theme</p>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                        <span class="plurid-container-button plurid-container-color"></span>
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-shadows">
                                        <p>Shadows (performance intensive)</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-reflections">
                                        <p>Reflections (performance intensive)</p>
                                        <input type="checkbox">
                                    </div>
                                </div>

                                <hr>

                                <div class="plurid-container-options-more-group-opacity">
                                    <div class="plurid-container-options-group-more plurid-container-more-opacity-after-click">
                                        <p>Parent Opacity After Click on Link</p>
                                        <input type="text">
                                        <input type="range">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-opacity-after-doubleclick">
                                        <p>General Opacity After Double-Click on Select</p>
                                        <input type="text">
                                        <input type="range">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-perspective">
                                        <p>Perspective</p>
                                        <input type="text">
                                        <input type="range">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-link-click-transform">
                                        <p>Click on Link Transforms to Normal View</p>
                                        <input type="checkbox">
                                    </div>

                                    <div class="plurid-container-options-group-more plurid-container-more-link-click-transform">
                                        <p>Responsive Sheet Width</p>
                                        <input type="checkbox">
                                    </div>
                                </div>

                                <hr>

                                <div class="plurid-container-options-group-more plurid-container-more-shortcuts">
                                    <p class="plurid-container-link-expand plurid-container-shortcuts-button">Shortcuts</p>
                                </div>
                                <div class="plurid-container-options-group-more plurid-container-more-always-show-options">
                                    <p class="plurid-container-link-expand ">Always Show Options Bar</p>
                                    <input type="checkbox">
                                </div>
                                <div class="plurid-container-options-group-more plurid-container-more-show-viewcube">
                                    <p class="plurid-container-link-expand ">Show Viewcube</p>
                                    <input type="checkbox">
                                </div>
                                <div class="plurid-container-options-group-more plurid-container-more-carve-design">
                                    <p class="plurid-container-link-expand ">Carve Design</p>
                                    <input type="checkbox">
                                </div>
                                <div class="plurid-container-options-group-more plurid-container-more-reset">
                                    <p class="plurid-container-link-expand ">Reset to Default</p>
                                </div>
                            </div>

                            <div class="plurid-container-options-shortcuts">
                                <div class="plurid-container-options-group-more">
                                    <p>Hold Button and Move Pointer:</p>
                                </div>
                                <div class="plurid-container-options-group-more">
                                    <p>Shift for Rotation</p>
                                </div>
                                <div class="plurid-container-options-group-more">
                                    <p>Alt/Option for Translation</p>
                                </div>
                                <div class="plurid-container-options-group-more">
                                    <p>Control/Command for Scale</p>
                                </div>
                            </div>
                        </div>
                    </div>`

    return content;
}


export function setButtons(container) {
    transformButtons(container);
    centerEverything(container);
    addAnotherRoot(container);
    moreOptions(container);
    lockTransforms(container);
    scrollTransform(container);
    transformSensitivity(container);
    containerBackground(container);
    generalTheme(container);
    linkTransformNormal(container);
    parentOpacityAfterClick(container);
    generalOpacityAfterDoubleClick(container);
    shortcuts(container);
    alwaysShowOptions(container);
    resetDefault(container);
}


function transformButtons(container) {
    function setTransformButton(transformPlurid, container, type, direction) {
        let button = container.getElementsByClassName(`plurid-container-${type}-${direction}`)[0];

        button.addEventListener('click', event => {
            transformPlurid = pluridScene.meta.activePlurid ? container.querySelector(`#${pluridScene.meta.activePlurid}`) : container.getElementsByTagName("plurid-roots")[0];

            if (type === 'rotate') {
                plurid.rotatePlurid(event, transformPlurid, direction);
            }
            if (type === 'translate') {
                plurid.translatePlurid(event, transformPlurid, direction);
            }
            if (type === 'scale') {
                plurid.scalePlurid(event, transformPlurid, direction);
            }
        });

        let timer;

        let rotatePlurid = function(event, direction) {
            plurid.rotatePlurid(event, transformPlurid, direction);
            timer = setTimeout(rotatePlurid, 35, event, direction);
        }

        let translatePlurid = function(event, direction) {
            plurid.translatePlurid(event, transformPlurid, direction);
            timer = setTimeout(translatePlurid, 25, event, direction);
        }

        let scalePlurid = function(event, direction) {
            plurid.scalePlurid(event, transformPlurid, direction);
            timer = setTimeout(scalePlurid, 35, event, direction);
        }


        button.addEventListener("mousedown", function(event) {
            transformPlurid = pluridScene.meta.activePlurid ? container.querySelector(`#${pluridScene.meta.activePlurid}`) : container.getElementsByTagName("plurid-roots")[0];

            if (type === 'rotate') {
                timer = setTimeout(rotatePlurid, 35, event, direction);
            }
            if (type === 'translate') {
                timer = setTimeout(translatePlurid, 25, event, direction);
            }
            if (type === 'scale') {
                timer = setTimeout(scalePlurid, 35, event, direction);
            }
        });

        button.addEventListener("mouseup", function(event) {
            clearTimeout(timer);
        });
    }

    let transformPlurid = pluridScene.meta.activePlurid ? container.getElementById(pluridScene.meta.activePlurid) : container.getElementsByTagName("plurid-roots")[0];

    let transformButtons = [
        {
            type: "rotate",
            direction: "up"
        },
        {
            type: "rotate",
            direction: "down"
        },
        {
            type: "rotate",
            direction: "left"
        },
        {
            type: "rotate",
            direction: "right"
        },

        {
            type: "translate",
            direction: "up"
        },
        {
            type: "translate",
            direction: "down"
        },
        {
            type: "translate",
            direction: "left"
        },
        {
            type: "translate",
            direction: "right"
        },

        {
            type: "scale",
            direction: "up"
        },
        {
            type: "scale",
            direction: "down"
        }
    ]

    transformButtons.map(button => {
        setTransformButton(transformPlurid, container, button.type, button.direction);
    });
}


function centerEverything(container) {
    let centerEverythingButton = container.getElementsByClassName('plurid-container-button-center-everything')[0];

    centerEverythingButton.addEventListener('click', event => {
        console.log('center everything');
    });
}


function addAnotherRoot(container) {
    let addAnotherRootButton = container.getElementsByClassName('plurid-container-button-add-root')[0];

    addAnotherRootButton.addEventListener('click', event => {
        // get extremities of the current pluridScene and add to the right/left
        if (event.shiftKey) {
            console.log('add root left');
        } else {
            console.log('add root right');
        }
    });
}


function moreOptions(container) {
    let moreButton = container.getElementsByClassName('plurid-container-button-more')[0];
    let moreContainer = container.getElementsByClassName('plurid-container-options-more')[0];

    moreButton.addEventListener('click', event => {
        if (moreContainer.style.display == ""
        || moreContainer.style.display == "none") {
            moreButton.classList.add("plurid-sheet-control-active");
            moreContainer.style.display = "block";
        } else {
            moreButton.classList.remove("plurid-sheet-control-active");
            moreContainer.style.display = "none";
        }
    });
}


function lockTransforms(container) {
    function setLocks(type, axis) {
        let button = container.getElementsByClassName(`plurid-container-more-lock-${type}-${axis}`)[0];

        button.addEventListener('click', event => {
            console.log('lock', type, axis);
        });
    }

    let locks = [
        {
            type: "rotation",
            axis: "x"
        },
        {
            type: "rotation",
            axis: "y"
        },
        {
            type: "translation",
            axis: "x"
        },
        {
            type: "translation",
            axis: "y"
        }
    ];

    locks.map(button => { setLocks(button.type, button.axis) });
}


function scrollTransform(container) {
    let button = container.getElementsByClassName('plurid-container-more-scroll-translate')[0];

    button.addEventListener('click', event => {
        console.log('scroll transform');
    });
}


function transformSensitivity(container) {

}


function containerBackground(container) {
    let button = container.getElementsByClassName('plurid-container-more-container-background')[0];

    button.addEventListener('click', event => {
        console.log('change container background');
    });
}


function generalTheme(container) {
    let button = container.getElementsByClassName('plurid-container-more-general-theme')[0];

    button.addEventListener('click', event => {
        let bodyClassList = document.body.classList;

        for (const bodyClass of bodyClassList) {
            if (bodyClass === "plurid-theme-light") {
                bodyClassList.add('plurid-theme-night');
                bodyClassList.remove('plurid-theme-light');
            }

            if (bodyClass === "plurid-theme-night") {
                bodyClassList.add('plurid-theme-dusk');
                bodyClassList.remove('plurid-theme-night');
            }

            if (bodyClass === "plurid-theme-dusk") {
                bodyClassList.add('plurid-theme-dawn');
                bodyClassList.remove('plurid-theme-dusk');
            }

            if (bodyClass === "plurid-theme-dawn") {
                bodyClassList.add('plurid-theme-light');
                bodyClassList.remove('plurid-theme-dawn');
            }
        }
    });
}


function linkTransformNormal(container) {
    let button = container.getElementsByClassName('plurid-container-more-link-click-transform')[0];

    button.addEventListener('click', event => {
        console.log('linkTransformNormal');
    });
}


function parentOpacityAfterClick(container) {

}


function generalOpacityAfterDoubleClick(container) {

}


function shortcuts(container) {

}


function alwaysShowOptions(container) {
    let button = container.getElementsByClassName('plurid-container-more-always-show-options')[0];

    button.addEventListener('click', event => {
        console.log('alwaysShowOptions');
    });
}


function resetDefault(container) {

}
