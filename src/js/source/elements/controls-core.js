export function renderControls(element, id) {
    var controls = document.createElement("plurid-controls");
    controls.id = `plurid-controls-${id}`;
    element.appendChild(controls);
}


export function contentControls () {
    let content = `<div class="plurid-container-controls-content">
                        <div class="plurid-controls-button plurid-controls-select" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 715.45 731.22"><defs></defs><title>Select</title><g><g id="Select"><path class="plurid-controls-buttons-svg" d="M354.25,731.22,340.3,363.64,0,316.45,715.45,0ZM181,291.07l207.7,28.81,8.06,212.42L609.53,101.52Z"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-parent" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 878.5 880.44"><defs></defs><title>Parent</title><g><g id="Parent"><path class="plurid-controls-buttons-svg" d="M521.28,838.25V386.06L334.86,406.83V250.66L878.5,193.4V787.71Zm44-501.32V787.64l269.31-38.1V242.22l-455.74,48v67.48Z"/><polygon class="plurid-controls-buttons-svg" points="0.44 0.68 0.44 696.24 405.19 879.75 405.19 182.91 0.44 0.68"/><path class="plurid-controls-buttons-svg" d="M405.63,880.44,0,696.52V0L405.63,182.63ZM.88,696,404.75,879.07V183.2L.88,1.36Z"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-minimize" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 874.5 50"><defs></defs><title>Minimize</title><g><g id="Minimize"><line class="plurid-controls-buttons-svg" y1="25" x2="874.5" y2="25"/><rect class="plurid-controls-buttons-svg" width="874.5" height="50"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-reduce-height" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 869.91 326"><defs></defs><title>Reduce</title><g><g id="Reduce_Height" data-name="Reduce Height"><path class="plurid-controls-buttons-svg" d="M869.91,326H228.37V43.58H0V0H869.91ZM272,282.42H826.33V43.58H272Z"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-reload" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 872.67 701"><defs></defs><title>Reload</title><g><g id="Reload"><polygon class="plurid-controls-buttons-svg" points="794 701 0 701 0 0 775 0 775 50 50 50 50 651 744 651 744 239 794 239 794 701"/><polygon class="plurid-controls-buttons-svg" points="707.31 455.04 660.69 436.96 773.57 145.79 872.67 437.97 825.33 454.03 770.43 292.21 707.31 455.04"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-extend" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 866 375.89"><defs></defs><title>Extend</title><g><g id="Extend"><rect class="plurid-controls-buttons-svg" x="31.02" y="165.42" width="796.17" height="43.32"/><polygon class="plurid-controls-buttons-svg" points="192.59 375.81 0 187 192.67 0 222.84 31.08 62.03 187.16 222.91 344.88 192.59 375.81"/><polygon class="plurid-controls-buttons-svg" points="673.33 375.89 643.16 344.8 803.97 188.73 643.09 31.01 673.41 0.08 866 188.89 673.33 375.89"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-close" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 875.09 875.82"><defs></defs><title>Close</title><g><g id="Close"><rect class="plurid-controls-buttons-svg" x="415.36" y="-158.88" width="44.45" height="1193.58" transform="translate(-181.48 437.37) rotate(-44.97)"/><rect class="plurid-controls-buttons-svg" x="-160.45" y="415.69" width="1187.63" height="44.45" transform="translate(-182.73 438.11) rotate(-45.32)"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-isolate" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 562 869.97"><defs></defs><title>Isolate</title><g><g id="Isolate"><path class="plurid-controls-buttons-svg" d="M562,870H0V0H562ZM43.5,826.47h475V43.5H43.5Z"/><rect class="plurid-controls-buttons-svg" x="259.25" y="166.16" width="43.5" height="537.64"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-back" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 874.8 394.66"><defs></defs><title>Back</title><g><g id="Back"><rect class="plurid-controls-buttons-svg" x="46.8" y="173.72" width="828" height="45.49"/><polygon class="plurid-controls-buttons-svg" points="202.25 394.66 0 196.38 202.33 0 234.01 32.64 65.15 196.54 234.1 362.18 202.25 394.66"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-forward" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 871.97 361.91"><defs></defs><title>Forward</title><g><g id="Next"><rect class="plurid-controls-buttons-svg" y="159.23" width="842.93" height="41.72"/><polygon class="plurid-controls-buttons-svg" points="686.43 361.91 657.38 331.98 812.23 181.68 657.3 29.79 686.5 0 871.97 181.83 686.43 361.91"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-url">
                            <div class="plurid-controls-url-container">
                                <div class="plurid-controls-button plurid-controls-button-url plurid-controls-search" tabindex="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 748.89 755.57"><defs></defs><title>Search</title><g><g id="Search"><line class="plurid-controls-buttons-svg" x1="17.83" y1="738.05" x2="359.83" y2="390.05"/><rect class="plurid-controls-buttons-svg" x="-55.13" y="539.05" width="487.92" height="50" transform="translate(-345.89 303.51) rotate(-45.51)"/><path class="plurid-controls-buttons-svg" d="M496.33,50A41.62,41.62,0,0,1,526,62.27L686.62,222.92a42,42,0,0,1,0,59.26L526,442.83a41.87,41.87,0,0,1-59.25,0L306.05,282.18a42,42,0,0,1,0-59.26L466.71,62.27A41.62,41.62,0,0,1,496.33,50m0-50a91.61,91.61,0,0,0-65,26.92L270.7,187.57a91.9,91.9,0,0,0,0,130L431.35,478.19a91.9,91.9,0,0,0,130,0L722,317.54a91.9,91.9,0,0,0,0-130L561.32,26.92A91.62,91.62,0,0,0,496.33,0Z"/></g></g></svg>
                                </div>
                                <input class="plurid-controls-url-input" type="text" tabindex="1" placeholder="Search">
                                <div class="plurid-controls-button plurid-controls-button-url plurid-controls-cancel" tabindex="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 875.09 875.82"><defs></defs><title>Close</title><g><g id="Close"><rect class="plurid-controls-buttons-svg" x="415.36" y="-158.88" width="44.45" height="1193.58" transform="translate(-181.48 437.37) rotate(-44.97)"/><rect class="plurid-controls-buttons-svg" x="-160.45" y="415.69" width="1187.63" height="44.45" transform="translate(-182.73 438.11) rotate(-45.32)"/></g></g></svg>
                                </div>
                            </div>
                        </div>

                        <div class="plurid-controls-button plurid-controls-extract" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 697.49 878"><defs></defs><title>Extract</title><g><g id="Extract_Root" data-name="Extract Root"><path class="plurid-controls-buttons-svg" d="M503,878H0V148.09H503ZM43.81,834.19H459.15V191.9H43.81Z"/><polygon class="plurid-controls-buttons-svg" points="697.49 782.49 487.19 782.49 487.19 738.68 653.68 738.68 653.68 43.81 223.41 43.81 223.26 161.26 179.45 161.2 179.66 0 697.49 0 697.49 782.49"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-opacity" tabindex="1">
                            100
                        </div>

                        <div class="plurid-controls-button plurid-controls-more" tabindex="1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 622.51 130.1"><defs></defs><title>More</title><g id="Layer_2" data-name="Layer 2"><g id="More"><rect class="plurid-controls-buttons-svg" x="20.2" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M130.1,130.1H0V0H130.1ZM40.4,89.69H89.69V40.4H40.4Z"/><rect class="plurid-controls-buttons-svg" x="266.21" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M376.11,130.1H246V0h130.1Zm-89.7-40.41H335.7V40.4H286.41Z"/><rect class="plurid-controls-buttons-svg" x="512.62" y="20.2" width="89.69" height="89.69"/><path class="plurid-controls-buttons-svg" d="M622.51,130.1H492.42V0H622.51ZM532.82,89.69h49.29V40.4H532.82Z"/></g></g></svg>
                        </div>
                    </div>

                    <div class="plurid-controls-open-close">
                        <div class="plurid-controls-open-close-character">
                            <!-- White up-pointing triangle: &#9651; White down-pointing triangle: &#9661; -->
                            &#9651;
                        </div>
                    </div>
                    `

    return content;
}


export function setControls(element) {

    let pluridControlsContent = element.getElementsByClassName("plurid-container-controls-content")[0];

    let pluridControlsOpenClose = element.getElementsByClassName("plurid-controls-open-close")[0];
    let pluridControlsOpenCloseCharacter = element.getElementsByClassName("plurid-controls-open-close-character")[0];
    let pluridControlsOpenCloseState = 1;

    pluridControlsOpenClose.addEventListener("click", event => {
        let parentPlurid = element.parentElement;

        if (pluridControlsOpenCloseState == 1) {
            parentPlurid.style.paddingTop = "50px";
            pluridControlsContent.style.display = "none";
            element.style.height = "15px";
            pluridControlsOpenCloseCharacter.innerHTML = "&#9661;";
        }

        if (pluridControlsOpenCloseState == 0) {
            parentPlurid.style.paddingTop = "100px";
            pluridControlsContent.style.display = "inline-flex";
            element.style.height = "60px";
            pluridControlsOpenCloseCharacter.innerHTML = "&#9651;";
        }

        pluridControlsOpenCloseState = pluridControlsOpenCloseState ? 0 : 1;
    })
}
