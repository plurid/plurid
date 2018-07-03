export function renderOptions(element) {
    var options = document.createElement("plurid-options");
    element.appendChild(options);
}


export function displayOptions(element) {
    // element.addEventListener("mousemove", event => {
    //     let cursorYLocation = event.pageY;
    //     let containerHeight = element.clientHeight;
    //     let optionsDisplayLimitOn = 80;
    //     let optionsDisplayLimitOff = 100;
    //     let optionsTag = document.getElementsByTagName("plurid-options");

    //     if (cursorYLocation > (containerHeight - optionsDisplayLimitOn)) {
    //         for (let optionsElement of optionsTag) {
    //             optionsElement.style.display = "block";
    //         }
    //     }

    //     if (cursorYLocation < (containerHeight - optionsDisplayLimitOff)){
    //         for (let optionsElement of optionsTag) {
    //             optionsElement.style.display = "none";
    //         }
    //     }
    // });
}


export function displayMoreOptions(element) {
    let moreButton = element.getElementsByClassName('plurid-container-button-more')[0];
    let moreContainer = element.getElementsByClassName('plurid-container-options-more')[0];

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


export function contentOptions() {
    let content = `<div class="plurid-container-options-content">
                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-rotate-left">&#x25c0;</span>
                        <span class="plurid-container-button plurid-container-rotate-up">&#x25B2;</span>
                        <p>Rotation</p>
                        <span class="plurid-container-button plurid-container-rotate-down">&#x25BC;</span>
                        <span class="plurid-container-button plurid-container-rotate-right">&#x25b6;</span>
                    </div>

                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-translate-left">&#x25c0;</span>
                        <span class="plurid-container-button plurid-container-translate-up">&#x25B2;</span>
                        <p>Translation</p>
                        <span class="plurid-container-button plurid-container-translate-down">&#x25BC;</span>
                        <span class="plurid-container-button plurid-container-translate-right">&#x25b6;</span>
                    </div>

                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-scale-up">&#x25B2;</span>
                        <p>Scale</p>
                        <span class="plurid-container-button plurid-container-scale-down">&#x25BC;</span>
                    </div>

                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-button-center-everything">
                            &#8281;
                        </span>
                    </div>

                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-button-add-root">
                            &#10746;
                        </span>
                    </div>

                    <div class="plurid-container-options-group">
                        <span class="plurid-container-button plurid-container-button-more">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 622.51 130.1"><defs></defs><title>More</title><g id="Layer_2" data-name="Layer 2"><g id="More"><rect class="plurid-controls-buttons-svg" x="20.2" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M130.1,130.1H0V0H130.1ZM40.4,89.69H89.69V40.4H40.4Z"/><rect class="plurid-controls-buttons-svg" x="266.21" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M376.11,130.1H246V0h130.1Zm-89.7-40.41H335.7V40.4H286.41Z"/><rect class="plurid-controls-buttons-svg" x="512.62" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M622.51,130.1H492.42V0H622.51ZM532.82,89.69h49.29V40.4H532.82Z"/></g></g></svg>
                        </span>
                    </div>

                    <div class="plurid-container-options-more">
                        <div class="plurid-container-options-more-group-transforms">
                            <!-- <label class="plurid-container-options-group-more plurid-controls-more-checkmark-container">
                                <span class="plurid-controls-more-container-text">
                                    Lock Rotation X
                                </span>
                                <span class="plurid-controls-more-container-shortcut">
                                    <input type="checkbox">
                                    <span class="plurid-controls-more-checkmark"></span>
                                </span>
                            </label> -->

                            <div class="plurid-container-options-group-more">
                                <p>Lock Rotation X</p>
                                <input type="checkbox">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Lock Rotation Y</p>
                                <input type="checkbox">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Use Scroll to Translate</p>
                                <input type="checkbox" class="plurid-container-use-scroll">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Lock Translation X</p>
                                <input type="checkbox">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Lock Translation Y</p>
                                <input type="checkbox">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Transform Sensitivity</p>
                                <input type="text">
                                <input type="range">
                            </div>
                        </div>

                        <hr>

                        <div class="plurid-container-options-more-group-colors">
                            <div class="plurid-container-options-group-more">
                                <p>Container Background</p>
                            <span class="plurid-container-button plurid-container-color"></span>
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>General Theme</p>
                                <span class="plurid-container-button plurid-container-color"></span>
                            </div>
                        </div>

                        <hr>

                        <div class="plurid-container-options-more-group-opacity">
                            <div class="plurid-container-options-group-more">
                                <p>Click on Link Transforms to Normal View</p>
                                <input type="checkbox">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>Parent Opacity After Click on Link</p>
                                <input type="text">
                                <input type="range">
                            </div>

                            <div class="plurid-container-options-group-more">
                                <p>General Opacity After Double-Click on Select</p>
                                <input type="text">
                                <input type="range">
                            </div>
                        </div>

                        <hr>

                        <div class="plurid-container-options-group-more">
                            <p class="plurid-container-link-expand plurid-container-shortcuts-button">Shortcuts</p>
                        </div>
                        <div class="plurid-container-options-group-more">
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
                </div>`

    return content;
}
