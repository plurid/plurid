export function renderOptions(element) {
    var options = document.createElement("plurid-options");
    element.appendChild(options);
}


export function displayOptions(element) {
    element.addEventListener("mousemove", event => {
        let cursorYLocation = event.pageY;
        let containerHeight = element.clientHeight;
        let optionsDisplayLimitOn = 80;
        let optionsDisplayLimitOff = 100;
        let optionsTag = document.getElementsByTagName("plurid-options");

        if (cursorYLocation > (containerHeight - optionsDisplayLimitOn)) {
            for (let optionsElement of optionsTag) {
                optionsElement.style.display = "block";
            }
        }

        if (cursorYLocation < (containerHeight - optionsDisplayLimitOff)){
            for (let optionsElement of optionsTag) {
                optionsElement.style.display = "none";
            }
        }
    })
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
                        <p class="plurid-container-link-expand plurid-container-more-button">More...</p>
                    </div>

                    <div class="plurid-container-options-more">
                        <div class="plurid-container-options-group">
                            <p>Background</p>
                            <span class="plurid-container-button plurid-container-color"></span>
                        </div>
                        <div class="plurid-container-options-group">
                            <p>Use Scroll to Translate</p>
                            <input type="checkbox" class="plurid-container-use-scroll">
                        </div>
                        <div class="plurid-container-options-group">
                            <p class="plurid-container-link-expand plurid-container-shortcuts-button">Shortcuts</p>
                        </div>
                    </div>

                    <div class="plurid-container-options-shortcuts">
                        <div class="plurid-container-options-group">
                            <p>Hold Button and Move Pointer:</p>
                        </div>
                        <div class="plurid-container-options-group">
                            <p>Shift for Rotation</p>
                        </div>
                        <div class="plurid-container-options-group">
                            <p>Alt/Option for Translation</p>
                        </div>
                        <div class="plurid-container-options-group">
                            <p>Control/Command for Scale</p>
                        </div>
                    </div>
                </div>`

    return content;
}
