import { activePlurid } from "../logic/get-plurid";
import { getSpecifiedParent } from "./sheet-core";
import { removeActiveSheetShadow,
         addActiveSheetShadow } from "./sheet-core";

export function renderControls(element, id) {
    let controls = document.createElement("plurid-controls");
    controls.id = `plurid-controls-${id}`;
    element.appendChild(controls);
}


export function contentControls () {
    let content = `<div class="plurid-container-controls-content">
                        <div class="plurid-button plurid-button-icon plurid-controls-select" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 715.45 731.22"><defs></defs><title>Select</title><g><g id="Select"><path class="plurid-button-icon-svg" d="M354.25,731.22,340.3,363.64,0,316.45,715.45,0ZM181,291.07l207.7,28.81,8.06,212.42L609.53,101.52Z"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-parent" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 878.5 880.44"><defs></defs><title>Parent</title><g><g id="Parent"><path class="plurid-button-icon-svg" d="M521.28,838.25V386.06L334.86,406.83V250.66L878.5,193.4V787.71Zm44-501.32V787.64l269.31-38.1V242.22l-455.74,48v67.48Z"/><polygon class="plurid-button-icon-svg" points="0.44 0.68 0.44 696.24 405.19 879.75 405.19 182.91 0.44 0.68"/><path class="plurid-button-icon-svg" d="M405.63,880.44,0,696.52V0L405.63,182.63ZM.88,696,404.75,879.07V183.2L.88,1.36Z"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-minimize" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 874.5 50"><defs></defs><title>Minimize</title><g><g id="Minimize"><line class="plurid-button-icon-svg" y1="25" x2="874.5" y2="25"/><rect class="plurid-button-icon-svg" width="874.5" height="50"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-reduce-height" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 869.91 326"><defs></defs><title>Reduce</title><g><g id="Reduce_Height" data-name="Reduce Height"><path class="plurid-button-icon-svg" d="M869.91,326H228.37V43.58H0V0H869.91ZM272,282.42H826.33V43.58H272Z"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-extend" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 866 375.89"><defs></defs><title>Extend</title><g><g id="Extend"><rect class="plurid-button-icon-svg" x="31.02" y="165.42" width="796.17" height="43.32"/><polygon class="plurid-button-icon-svg" points="192.59 375.81 0 187 192.67 0 222.84 31.08 62.03 187.16 222.91 344.88 192.59 375.81"/><polygon class="plurid-button-icon-svg" points="673.33 375.89 643.16 344.8 803.97 188.73 643.09 31.01 673.41 0.08 866 188.89 673.33 375.89"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-reset-transforms" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 866 870.97"><defs></defs><title>Reset Transforms</title><g id="Layer_2" data-name="Layer 2"><g id="Reset_Transforms" data-name="Reset Transforms"><rect class="plurid-button-icon-svg" x="31.05" y="418.97" width="796.17" height="43.32" transform="translate(-185.88 432.5) rotate(-45)"/><polygon class="plurid-button-icon-svg" points="395.35 741.32 125.66 743.99 129.66 475.53 172.97 476.18 169.63 700.24 394.92 698.01 395.35 741.32"/><polygon class="plurid-button-icon-svg" points="735.34 401.44 692.02 400.79 695.37 176.73 470.08 178.96 469.65 135.65 739.35 132.97 735.34 401.44"/><path class="plurid-button-icon-svg" d="M865.5,870.47H.5V.5h865ZM44,827H822V44H44Z"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-isolate" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 562 869.97"><defs></defs><title>Isolate</title><g><g id="Isolate"><path class="plurid-button-icon-svg" d="M562,870H0V0H562ZM43.5,826.47h475V43.5H43.5Z"/><rect class="plurid-button-icon-svg" x="259.25" y="166.16" width="43.5" height="537.64"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-close" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 875.09 875.82"><defs></defs><title>Close</title><g><g id="Close"><rect class="plurid-button-icon-svg" x="415.36" y="-158.88" width="44.45" height="1193.58" transform="translate(-181.48 437.37) rotate(-44.97)"/><rect class="plurid-button-icon-svg" x="-160.45" y="415.69" width="1187.63" height="44.45" transform="translate(-182.73 438.11) rotate(-45.32)"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-reload" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 872.67 701"><defs></defs><title>Reload</title><g><g id="Reload"><polygon class="plurid-button-icon-svg" points="794 701 0 701 0 0 775 0 775 50 50 50 50 651 744 651 744 239 794 239 794 701"/><polygon class="plurid-button-icon-svg" points="707.31 455.04 660.69 436.96 773.57 145.79 872.67 437.97 825.33 454.03 770.43 292.21 707.31 455.04"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-back" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 874.8 394.66"><defs></defs><title>Back</title><g><g id="Back"><rect class="plurid-button-icon-svg" x="46.8" y="173.72" width="828" height="45.49"/><polygon class="plurid-button-icon-svg" points="202.25 394.66 0 196.38 202.33 0 234.01 32.64 65.15 196.54 234.1 362.18 202.25 394.66"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-forward" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 871.97 361.91"><defs></defs><title>Forward</title><g><g id="Next"><rect class="plurid-button-icon-svg" y="159.23" width="842.93" height="41.72"/><polygon class="plurid-button-icon-svg" points="686.43 361.91 657.38 331.98 812.23 181.68 657.3 29.79 686.5 0 871.97 181.83 686.43 361.91"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-url">
                            <div class="plurid-controls-url-container">
                                <div class="plurid-button plurid-button-icon plurid-button plurid-button-icon-url plurid-controls-search" tabindex="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 748.89 755.57"><defs></defs><title>Search</title><g><g id="Search"><line class="plurid-button-icon-svg" x1="17.83" y1="738.05" x2="359.83" y2="390.05"/><rect class="plurid-button-icon-svg" x="-55.13" y="539.05" width="487.92" height="50" transform="translate(-345.89 303.51) rotate(-45.51)"/><path class="plurid-button-icon-svg" d="M496.33,50A41.62,41.62,0,0,1,526,62.27L686.62,222.92a42,42,0,0,1,0,59.26L526,442.83a41.87,41.87,0,0,1-59.25,0L306.05,282.18a42,42,0,0,1,0-59.26L466.71,62.27A41.62,41.62,0,0,1,496.33,50m0-50a91.61,91.61,0,0,0-65,26.92L270.7,187.57a91.9,91.9,0,0,0,0,130L431.35,478.19a91.9,91.9,0,0,0,130,0L722,317.54a91.9,91.9,0,0,0,0-130L561.32,26.92A91.62,91.62,0,0,0,496.33,0Z"/></g></g></svg>
                                </div>
                                <input class="plurid-controls-url-input" type="text" tabindex="1" placeholder="Search">
                                <div class="plurid-button plurid-button-icon plurid-button plurid-button-icon-url plurid-controls-cancel" tabindex="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 875.09 875.82"><defs></defs><title>Cancel</title><g><g id="Close"><rect class="plurid-button-icon-svg" x="415.36" y="-158.88" width="44.45" height="1193.58" transform="translate(-181.48 437.37) rotate(-44.97)"/><rect class="plurid-button-icon-svg" x="-160.45" y="415.69" width="1187.63" height="44.45" transform="translate(-182.73 438.11) rotate(-45.32)"/></g></g></svg>
                                </div>
                            </div>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-extract" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 697.49 878"><defs></defs><title>Extract</title><g><g id="Extract_Root" data-name="Extract Root"><path class="plurid-button-icon-svg" d="M503,878H0V148.09H503ZM43.81,834.19H459.15V191.9H43.81Z"/><polygon class="plurid-button-icon-svg" points="697.49 782.49 487.19 782.49 487.19 738.68 653.68 738.68 653.68 43.81 223.41 43.81 223.26 161.26 179.45 161.2 179.66 0 697.49 0 697.49 782.49"/></g></g></svg>
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-opacity" tabindex="1">
                            100
                        </div>

                        <div class="plurid-button plurid-button-icon plurid-controls-more" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 622.51 130.1"><defs></defs><title>More</title><g id="Layer_2" data-name="Layer 2"><g id="More"><rect class="plurid-button-icon-svg" x="20.2" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M130.1,130.1H0V0H130.1ZM40.4,89.69H89.69V40.4H40.4Z"/><rect class="plurid-button-icon-svg" x="266.21" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M376.11,130.1H246V0h130.1Zm-89.7-40.41H335.7V40.4H286.41Z"/><rect class="plurid-button-icon-svg" x="512.62" y="20.2" width="89.69" height="89.69"/><path class="plurid-button-icon-svg" d="M622.51,130.1H492.42V0H622.51ZM532.82,89.69h49.29V40.4H532.82Z"/></g></g></svg>
                        </div>

                        <plurid-link page="./ads.html">
                            <div class="plurid-button plurid-button-icon" tabindex="1">
                                Ads
                            </div>
                        </plurid-link>
                    </div>

                    <div class="plurid-controls-open-close">
                        <div class="plurid-button plurid-controls-open-close-character">
                            <!-- White up-pointing triangle: &#9651; White down-pointing triangle: &#9661; -->
                            &#9651;
                        </div>
                    </div>

                    <div class="plurid-controls-message">
                        <div class="plurid-controls-message-close">✕</div>
                        <div class="plurid-controls-message-content">
                        </div>
                    </div>

                    <div class="plurid-controls-more-container">
                        <ul>
                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Open in New Tab
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#8997; &#8984; T
                                </span>
                            </li>
                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Open in New Window
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#8997; &#8984; N
                                </span>
                            </li>
                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Open in New Incognito Window
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#8679; &#8997; &#8984; N
                                </span>
                            </li>

                            <hr>

                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Flip Branch
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#8997; F
                                </span>
                            </li>
                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Flip Content
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#8997; V
                                </span>
                            </li>
                            <li class="plurid-controls-more-sheet-history">
                                <span class="plurid-controls-more-container-text">
                                    Sheet History
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    &#9654;
                                </span>
                                <div class="plurid-controls-sheet-history-container">
                                    <ul>
                                        <li>
                                            https://plurid.com/
                                        </li>
                                        <li>
                                            https://deview.plurid.com/3kagndleoa
                                        </li>
                                        <li>
                                            https://plurid.com/
                                        </li>
                                        <li>
                                            https://deview.plurid.com/jdpiar1nra
                                        </li>
                                        <li>
                                            https://plurid.com/
                                        </li>
                                        <li>
                                            https://deview.plurid.com/dkpaosn11z
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            <hr>

                            <label class="plurid-controls-more-checkmark-container">
                                <li>
                                    <span class="plurid-controls-more-container-text">
                                        Opaque Back
                                    </span>
                                    <span class="plurid-controls-more-container-shortcut">
                                        <input type="checkbox">
                                        <span class="plurid-controls-more-checkmark"></span>
                                    </span>
                                </li>
                            </label>
                            <li class="plurid-controls-more-back-color">
                                <span class="plurid-controls-more-container-text">
                                    Back Background Color
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-back-color-input">
                                    <input type="text" value="#ff0000">
                                </span>
                                <div class="plurid-controls-more-back-color-container">
                                    <div class="plurid-controls-more-selected-color">
                                    </div>
                                    <div class="plurid-controls-more-select-color">
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Hue
                                                </div>
                                                <div>
                                                    <input type="text">
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Saturation
                                                </div>
                                                <div>
                                                    <input type="text"> %
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Lightness
                                                </div>
                                                <div>
                                                    <input type="text"> %
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li class="plurid-controls-more-front-color">
                                <span class="plurid-controls-more-container-text">
                                    Front Background Color
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-front-color-input">
                                    <input type="text" value="#ff0000">
                                </span>
                                <div class="plurid-controls-more-front-color-container">
                                    <div class="plurid-controls-more-selected-color">
                                    </div>
                                    <div class="plurid-controls-more-select-color">
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Hue
                                                </div>
                                                <div>
                                                    <input type="text">
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Saturation
                                                </div>
                                                <div>
                                                    <input type="text"> %
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                        <div class="plurid-controls-more-select-color-group">
                                            <div class="plurid-controls-more-select-color-group-element">
                                                <div>
                                                    Lightness
                                                </div>
                                                <div>
                                                    <input type="text"> %
                                                </div>
                                            </div>
                                            <input type="range">
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <label class="plurid-controls-more-checkmark-container">
                                <li>
                                    <span class="plurid-controls-more-container-text">
                                        Transparent Sheet
                                    </span>
                                    <span class="plurid-controls-more-container-shortcut">
                                        <input type="checkbox">
                                        <span class="plurid-controls-more-checkmark"></span>
                                    </span>
                                </li>
                            </label>
                            <li>
                                Reset Colors
                            </li>

                            <hr>

                            <li class="plurid-controls-more-branch-angle">
                                <span class="plurid-controls-more-container-text">
                                    <span class="plurid-controls-more-branch-angle-span-text">
                                        Branch Angle
                                    </span>
                                    <span class="plurid-controls-more-branch-angle-span-range">
                                        <input type="range" min="1" max="180" value="90">
                                    </span>
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-branch-angle-input">
                                    <input type="text" value="90"> °
                                </span>
                            </li>

                            <li class="plurid-controls-more-bridge-opacity">
                                <span class="plurid-controls-more-container-text">
                                    <span class="plurid-controls-more-bridge-opacity-span-text">
                                        Bridge Opacity
                                    </span>
                                    <span class="plurid-controls-more-bridge-opacity-span-range">
                                        <input type="range" min="1" max="100" value="90">
                                    </span>
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-bridge-opacity-input">
                                    <input type="text" value="90">
                                </span>
                            </li>

                            <hr>

                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Sheet Width
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-sheet-width-input">
                                    <input type="text" value="1440"> px
                                </span>
                            </li>
                            <li>
                                <span class="plurid-controls-more-container-text">
                                    Sheet Height
                                </span>
                                <span class="plurid-controls-more-container-shortcut plurid-controls-more-sheet-height-input">
                                    <input type="text" value="950"> px
                                </span>
                            </li>

                            <label class="plurid-controls-more-checkmark-container">
                                <li>
                                    <span class="plurid-controls-more-container-text">
                                        Lock Sheet Size
                                    </span>
                                    <span class="plurid-controls-more-container-shortcut">
                                        <input type="checkbox">
                                        <span class="plurid-controls-more-checkmark"></span>
                                    </span>
                                </li>
                            </label>
                            <li>Reset Sheet Size</li>

                            <hr>

                            <label class="plurid-controls-more-checkmark-container">
                                <li>
                                    <span class="plurid-controls-more-container-text">
                                        Show Icons Tooltips
                                    </span>
                                    <span class="plurid-controls-more-container-shortcut">
                                        <input type="checkbox">
                                        <span class="plurid-controls-more-checkmark"></span>
                                    </span>
                                </li>
                            </label>

                            <li>Shortcuts</li>
                            <li>Edit Buttons</li>
                            <li>Reset to Default</li>

                            <hr>

                            <li>About Plurid</li>
                        </ul>
                    </div>
                    `

    return content;
}


export function setControls(element) {
    setActivePlurid(element);
    goToParent(element);
    minimizeSelectedSheet(element);
    reduceSelectedSheet(element);
    reloadPlurid(element);
    extendBridge(element);
    closePlurid(element);
    isolatePlurid(element);
    backPlurid(element);
    forwardPlurid(element);
    searchPlurid(element);
    extractRoot(element);
    opacityPlurid(element);

    morePlurid(element);
    openCloseControls(element);
    setControlsMessageClose(element);
}


function setActivePlurid(element) {
    let pluridSelect = element.getElementsByClassName("plurid-controls-select")[0];

    pluridSelect.addEventListener("click", (event) => {
        let pluridRoot = getSpecifiedParent(pluridSelect, 'PLURID-ROOT');
        pluridScene.meta.activePlurid = pluridRoot.id;

        pluridScene.meta.previousActiveSheet = pluridScene.meta.activeSheet;
        pluridScene.meta.activeSheet = element.parentElement.id;

        removeActiveSheetShadow(pluridScene.meta.previousActiveSheet, 'plurid-sheet-active-transform');
        addActiveSheetShadow(pluridScene.meta.activeSheet, 'plurid-sheet-active-transform');
    });

    // pluridSelect.addEventListener("dblclick", (event) => {
    //     // console.log('dblclick', pluridSelect);
    //     // console.log(pluridSelect.parentElement.parentElement.parentElement);
    //     activePlurid.selected = pluridSelect.parentElement.parentElement.parentElement;
    //     let activeRoot = document.getElementById(activePlurid.selected.id).parentElement;
    //     let activeRoots = document.getElementById(activePlurid.selected.id).parentElement.parentElement;
    //     // console.log(active);
    //     activeRoot.style.transform = "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)";
    //     activeRoots.style.transform = "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)";
    // });
}


function goToParent(element) {
    let pluridParent = element.getElementsByClassName("plurid-controls-parent")[0];
    let bridge = element.parentElement.parentElement.parentElement.children[0];
    let scion = element.parentElement.parentElement.parentElement.children[1];
    let controls = pluridParent.parentElement;

    if (bridge.nodeName == "PLURID-BRIDGE") {
        pluridParent.addEventListener('click', event => {
            console.log('Plurid Parent');
        });
    } else {
        pluridParent.classList.add("plurid-button-disabled");
    }
}


function minimizeSelectedSheet(element) {
    let pluridMinimize = element.getElementsByClassName("plurid-controls-minimize")[0];
    let pluridReduce = element.getElementsByClassName("plurid-controls-reduce-height")[0];

    pluridMinimize.addEventListener('click', event => {
        let sheet = element.parentElement;
        let sheetChildren = pluridScene.getChildrenBySheetId(sheet.id);

        if (pluridReduce.classList.contains("plurid-button-active")) {
            pluridReduce.classList.remove("plurid-button-active");
        }

        if (sheet.classList.contains("plurid-sheet-reduce-height")) {
            sheet.classList.remove("plurid-sheet-reduce-height");
            toggleChildren(sheetChildren);
        }

        sheet.classList.toggle("plurid-sheet-minimize");
        pluridMinimize.classList.toggle("plurid-button-active");
        toggleChildren(sheetChildren);
    })
}


function reduceSelectedSheet(element) {
    let pluridReduce = element.getElementsByClassName("plurid-controls-reduce-height")[0];
    let pluridMinimize = element.getElementsByClassName("plurid-controls-minimize")[0];


    pluridReduce.addEventListener('click', event => {
        let sheet = element.parentElement;
        let sheetChildren = pluridScene.getChildrenBySheetId(sheet.id);

        let sheetHeight = window.getComputedStyle(sheet,null).getPropertyValue("height");
        sheetHeight = parseInt(sheetHeight);
        if (sheetHeight > 699 && sheetHeight > 60) {
            if (sheet.classList.contains("plurid-sheet-minimize")) {
                sheet.classList.remove("plurid-sheet-minimize");
                toggleChildren(sheetChildren);
            }
            sheet.classList.toggle("plurid-sheet-reduce-height");
            pluridReduce.classList.toggle("plurid-button-active");
            toggleChildren(sheetChildren);
        }

        if (sheetHeight <= 60) {
            pluridMinimize.classList.remove("plurid-button-active");
            if (sheet.classList.contains("plurid-sheet-minimize")) {
                sheet.classList.remove("plurid-sheet-minimize");
                toggleChildren(sheetChildren);
            }
            sheet.classList.add("plurid-sheet-reduce-height");
            pluridReduce.classList.add("plurid-button-active");
            toggleChildren(sheetChildren);
        }
    });
}


/**
 * Helper function to toggle show/hide of plurid branches.
 *
 * @param {Array} sheetChildren
 */
function toggleChildren(sheetChildren) {
    for (let child of sheetChildren) {
        let branch = document.getElementById(child);
        if (branch.style.display === "none") {
            branch.style.display = "block";
        } else {
            branch.style.display = "none";
        }
    }
}


function closePlurid(element) {
    let pluridParentClose = element.getElementsByClassName("plurid-controls-close")[0];

    pluridParentClose.addEventListener("click", event => {
        let sheet = element.parentElement;
        let sheetChildren = pluridScene.getChildrenBySheetId(sheet.id);

        if (sheet.parentElement.nodeName == "PLURID-ROOT") {
            let pluridRoot = sheet.parentElement;
            pluridRoot.removeChild(sheet);
            removeChildren(pluridRoot, sheetChildren);
        } else {
            let pluridRoot = sheet.parentElement.parentElement.parentElement;
            if (pluridRoot.nodeName == "PLURID-ROOT") {
                let branch = sheet.parentElement.parentElement;
                pluridRoot.removeChild(branch);
                removeChildren(pluridRoot, sheetChildren);
            }
        }

        pluridScene.meta.activePlurid = 'plurid-roots-1';
    });
}


/**
 * Helper function to remove plurid branches.
 *
 * @param {HTMLElement} pluridRoot
 * @param {Array} sheetChildren
 */
function removeChildren(pluridRoot, children) {
    if (children) {
        for (let child of children) {
            let branch = document.getElementById(child);
            if (branch) {
                pluridRoot.removeChild(branch);
            }
        }
    }
}


function reloadPlurid(element) {
    let pluridReload = element.getElementsByClassName("plurid-controls-reload")[0];
    let sheet = element.parentElement;
    let pluridSearchInput = element.getElementsByClassName("plurid-controls-url-input")[0];
    let url = pluridSearchInput.value;

    if (!url) {
        pluridReload.classList.add("plurid-button-disabled");
    }

    pluridReload.addEventListener('click', event => {
        url = pluridSearchInput.value;
        if (url) {
            pluridReload.classList.add("rotate-button");
            getPage(url, sheet, element);
            setTimeout(() => {
                pluridReload.classList.remove("rotate-button");
            }, 600);
        }
    });
}


function extendBridge(element) {
    let bridgeExtend = element.getElementsByClassName("plurid-controls-extend")[0];
    let bridge = element.parentElement.parentElement.parentElement.children[0];
    let scion = element.parentElement.parentElement.parentElement.children[1];
    let controls = bridgeExtend.parentElement;

    if (bridge.nodeName == "PLURID-BRIDGE") {
        bridgeExtend.addEventListener('mousedown', () => {
            document.body.style.cursor = "-webkit-grabbing";
            document.body.style.cursor = "grabbing";
            bridgeExtend.style.cursor = "-webkit-grabbing";
            bridgeExtend.style.cursor = "grabbing";
            window.addEventListener('mousemove', extend);

            window.addEventListener('mouseup', () => {
                document.body.style.cursor = "default";
                bridgeExtend.style.cursor = "-webkit-grab";
                bridgeExtend.style.cursor = "grab";
                window.removeEventListener('mousemove', extend);
            });
        });

    } else {
        bridgeExtend.classList.add("plurid-button-disabled");
    }

    function extend(event) {
        let width = parseInt(bridge.style.width) || 100;
        let right = parseInt(scion.style.right) || -100;
        // console.log('bridge.style.width', bridge.style.width);
        // console.log('scion.style.right', scion.style.right);
        // console.log(width);
        width = width + event.movementX + "px";
        right = right - event.movementX + "px";

        if (parseInt(bridge.style.width) <= 0) {
            // console.log(parseInt(width));
            // if (parseInt(width) > 0) {
                bridge.style.width = "100px";
                scion.style.right = "-100px";
            // }
        } else {
            bridge.style.width = width;
            scion.style.right = right;
        }

        // TODO
        // update <plurid-branch>es currently open
        // with the appropriate length of the <plurid-bridge>
    }

}


function isolatePlurid(element) {
    let pluridIsolate = element.getElementsByClassName("plurid-controls-isolate")[0];

    pluridIsolate.addEventListener('click', event => {
        console.log('Plurid Isolate');
    });
}


function backPlurid(element) {
    let pluridBack = element.getElementsByClassName("plurid-controls-back")[0];

    pluridBack.addEventListener('click', event => {
        console.log('Plurid Back');
    });
}


function forwardPlurid(element) {
    let pluridForward = element.getElementsByClassName("plurid-controls-forward")[0];

    pluridForward.addEventListener('click', event => {
        console.log('Plurid Forward');
    });
}


function searchPlurid(element) {
    let pluridSearch = element.getElementsByClassName("plurid-controls-search")[0];
    let pluridSearchInput = element.getElementsByClassName("plurid-controls-url-input")[0];
    let pluridCancelSearch = element.getElementsByClassName("plurid-controls-cancel")[0];
    let sheet = element.parentElement;

    if (sheet.parentElement.nodeName == "PLURID-ROOT") {
        let pluridRoot = sheet.parentElement;
    } else {
        let pluridRoot = sheet.parentElement.parentElement.parentElement;
        if (pluridRoot.nodeName == "PLURID-ROOT") {
            let branch = sheet.parentElement.parentElement;
            setSearchLink(branch.link, pluridSearchInput);
        }
    }

    function setSearchLink(branchLink, pluridSearchInput) {
        let link = document.getElementById(branchLink);
        let linkHref;

        if (link.nodeName == "A") {
            linkHref = link.href;
        }

        if (link.nodeName == "PLURID-LINK") {
            linkHref = link.page;
            linkHref = new URL(linkHref, window.location.href).href;
        }

        pluridSearchInput.value = linkHref;
        let pluridReload = element.getElementsByClassName("plurid-controls-reload")[0];
        pluridReload.classList.remove("plurid-sheet-controls-disabled");
    }


    pluridSearch.addEventListener('click', event => {
        search(pluridSearchInput.value, sheet, element);
    });

    pluridCancelSearch.addEventListener('click', event => {
        clearSearch(pluridSearchInput);
    });

    pluridSearchInput.addEventListener('keydown', event => {
        if (event.key == "Escape") {
            clearSearch(pluridSearchInput);
        }

        if (event.key == "Enter") {
            search(pluridSearchInput.value, sheet, element);
        }
    })

    function clearSearch(searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }

    function search(url, sheet) {
        if (!url) {
            let message = "Nothing to search for.";
            setControlsMessage(element, message);
        } else {
            let sheetChildren = pluridScene.getChildrenBySheetId(sheet.id);

            if (sheet.parentElement.nodeName == "PLURID-ROOT") {
                let pluridRoot = sheet.parentElement;
                pluridRoot.removeChild(sheet);
                removeChildren(pluridRoot, sheetChildren);
            } else {
                let pluridRoot = sheet.parentElement.parentElement.parentElement;
                if (pluridRoot.nodeName == "PLURID-ROOT") {
                    let branch = sheet.parentElement.parentElement;
                    removeChildren(pluridRoot, sheetChildren);
                }
            }

            getPage(url, sheet, element);
        }
    }
}


function getPage(url, sheet, element) {
    let sheetContent = sheet.getElementsByTagName('plurid-content')[0];
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(this.responseText, "text/html");

            sheetContent.innerHTML = doc.body.innerHTML;
        }

        if (this.status === 404) {
            let message = `Page not found.`;
            setControlsMessage(element, message);
        }
    };

    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Cache-Control", "no-cache");
    xhttp.setRequestHeader("Pragma", "no-cache");
    xhttp.send();
}


function extractRoot(element) {
    let pluridExtract = element.getElementsByClassName("plurid-controls-extract")[0];

    pluridExtract.addEventListener('click', event => {
        console.log('Plurid Root Extract');
    });
}


function opacityPlurid(element) {
    let pluridOpacity = element.getElementsByClassName("plurid-controls-opacity")[0];
    let sheet = element.parentElement;

    pluridOpacity.addEventListener('click', event => {
        // MAYBE
        // type into the opacity button text

        // if (event.shiftKey) {
        //     pluridOpacity.setAttribute("contenteditable", "true");
        //     pluridOpacity.addEventListener('keydown', event => {
        //         // console.log(event.key);
        //         const isNumber = isFinite(event.key);
        //         if (!isNumber) {
        //             if (event.key != "Backspace"
        //                 && event.key != "Delete"
        //                 && event.key != "Enter") {
        //                 event.preventDefault();
        //             }
        //         }

        //         pluridOpacity.addEventListener('input', event => {
        //             let opacity = pluridOpacity.innerText;
        //             // console.log(opacity);
        //             sheet.style.opacity = opacity / 100;
        //         })

        //         if (event.key == "Enter") {
        //             pluridOpacity.setAttribute("contenteditable", "false");
        //             pluridOpacity.blur();
        //         }
        //     });
        // } else {
            setOpacity(event, sheet, pluridOpacity);
        // }
    });

    function setOpacity(event, sheet, pluridOpacity) {
        let opacity = parseInt(pluridOpacity.innerText);

        if (opacity == 100) {
            pluridOpacity.innerText = 70;
            sheet.style.opacity = 0.7;
        } else if (opacity == 70) {
            pluridOpacity.innerText = 35;
            sheet.style.opacity = .35;
        } else {
            pluridOpacity.innerText = 100;
            sheet.style.opacity = 1;
        }
    }
}


function morePlurid(element) {
    let pluridMore = element.getElementsByClassName("plurid-controls-more")[0];
    let pluridMoreContainer = element.getElementsByClassName("plurid-controls-more-container")[0];
    let sheet = element.parentElement;

    pluridMore.addEventListener('click', event => {
        if (pluridMoreContainer.style.display == "" ||
            pluridMoreContainer.style.display == "none") {
            pluridMoreContainer.style.display = "block";
            pluridMore.classList.add("plurid-sheet-control-active");
        } else {
            pluridMoreContainer.style.display = "none";
            pluridMore.classList.remove("plurid-sheet-control-active");
        }
    });
}


function openCloseControls(element) {
    let pluridControlsContent = element.getElementsByClassName("plurid-container-controls-content")[0];
    let pluridControlsOpenClose = element.getElementsByClassName("plurid-controls-open-close")[0];
    let pluridControlsOpenCloseCharacter = element.getElementsByClassName("plurid-controls-open-close-character")[0];
    let pluridControlsOpenCloseState = 1;

    pluridControlsOpenCloseCharacter.addEventListener("click", event => {
        let parentPlurid = element.parentElement;

        if (pluridControlsOpenCloseState == 1) {
            parentPlurid.style.paddingTop = "50px";
            pluridControlsContent.style.display = "none";
            element.style.height = "11px";
            pluridControlsOpenClose.style.bottom = "3px";
            pluridControlsOpenCloseCharacter.innerHTML = "&#9661;";
        }

        if (pluridControlsOpenCloseState == 0) {
            parentPlurid.style.paddingTop = "80px";
            pluridControlsContent.style.display = "inline-flex";
            pluridControlsOpenClose.style.bottom = "2px";
            element.style.height = "50px";
            pluridControlsOpenCloseCharacter.innerHTML = "&#9651;";
        }

        pluridControlsOpenCloseState = pluridControlsOpenCloseState ? 0 : 1;
    });
}


function setControlsMessageClose(element) {
    let pluridMessage = element.getElementsByClassName("plurid-controls-message")[0];
    let pluridMessageClose = element.getElementsByClassName("plurid-controls-message-close")[0];
    let pluridMessageContent = element.getElementsByClassName("plurid-controls-message-content")[0];

    pluridMessageClose.addEventListener("click", event => {
        pluridMessage.style.display = "none";
        pluridMessageContent.innerHTML = "";
    });
}


function setControlsMessage(element, message) {
    let pluridMessage = element.getElementsByClassName("plurid-controls-message")[0];
    let pluridMessageContent = element.getElementsByClassName("plurid-controls-message-content")[0];

    pluridMessageContent.innerHTML = message;
    pluridMessage.style.display = "block";
    let timeout = 1250;

    setTimeout(() => {
        pluridMessage.style.display = "none";
        pluridMessageContent.innerHTML = "";
    }, timeout);
}
