export function renderControls(element, id) {
    var controls = document.createElement("plurid-controls");
    controls.id = `plurid-controls-${id}`;
    element.appendChild(controls);
}


export function contentControls () {
    let content = `<div class="plurid-container-controls-content">
                        <div class="plurid-controls-button plurid-controls-parent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.35 1001.55"><defs><style>.cls-1{fill:none;stroke-width:50px;}.cls-1,.cls-2{stroke:#fff;stroke-miterlimit:10;}</style></defs><title>Parent</title><g id="parent" data-name="parent"><g id="Parent"><polygon class="cls-1" points="405.92 307.64 405.92 434.86 617.99 411.22 617.99 924.77 974.35 874.36 974.35 247.77 405.92 307.64"/><polygon class="cls-2" points="0.5 0.77 0.5 792.01 460.92 1000.77 460.92 208.07 0.5 0.77"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-minimize">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.5 50"><defs><style>.cls-1{stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Minimize</title><g id="minimize" data-name="minimize"><g id="Minimize"><line class="cls-1" y1="25" x2="999.5" y2="25"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-reduce-height">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 998 374"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Reduce Height</title><g id="reduce" data-name="reduce"><g id="Reduce_Height" data-name="Reduce Height"><polygon class="cls-1" points="0 25 973 25 973 349 287 349 287 25 0 25"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-reload">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 872.68 701"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Reload</title><g id="Layer_2" data-name="Layer 2"><g id="Reload"><polyline class="cls-1" points="769 239 769 676 25 676 25 25 775 25"/><polyline class="cls-1" points="684 446 772 219 849 446"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-extend">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.6 433.88"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Extend</title><g id="Layer_2" data-name="Layer 2"><g id="Extend"><line class="cls-1" x1="35.8" y1="215.94" x2="954.8" y2="215.94"/><polyline class="cls-1" points="239.8 17.94 35.8 215.94 239.8 415.94"/><polyline class="cls-1" points="759.8 415.94 963.8 217.94 759.8 17.94"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 984.46 985.29"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Close</title><g id="Layer_2" data-name="Layer 2"><g id="Close"><line class="cls-1" x1="17.78" y1="17.67" x2="966.78" y2="967.62"/><line class="cls-1" x1="17.78" y1="967.62" x2="957.28" y2="17.67"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-isolate">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 646 1000"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Isolate</title><g id="Layer_2" data-name="Layer 2"><g id="Isolate"><rect class="cls-1" x="25" y="25" width="596" height="950"/><line class="cls-1" x1="323" y1="191" x2="323" y2="809"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-back">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 997.8 433.79"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Back</title><g id="Layer_2" data-name="Layer 2"><g id="Back"><line class="cls-1" x1="32.8" y1="215.94" x2="997.8" y2="215.94"/><polyline class="cls-1" points="239.8 17.94 35.8 215.94 239.8 415.94"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-forward">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.8 433.79"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Next</title><g id="Layer_2" data-name="Layer 2"><g id="Next"><line class="cls-1" y1="215.85" x2="965" y2="215.85"/><polyline class="cls-1" points="760 415.85 964 217.85 760 17.85"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-url">
                            <input type="text">
                        </div>

                        <div class="plurid-controls-button plurid-controls-extract">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 796 1002"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>Extract Root</title><g id="Layer_2" data-name="Layer 2"><g id="Extract_Root" data-name="Extract Root"><rect class="cls-1" x="25" y="194" width="524" height="783"/><polyline class="cls-1" points="229.79 184 230 25 771 25 771 868 556 868"/></g></g></svg>
                        </div>

                        <div class="plurid-controls-button plurid-controls-opacity">
                            100
                        </div>

                        <div class="plurid-controls-button plurid-controls-more">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 708.51 161"><defs><style>.cls-1{stroke:#fff;stroke-miterlimit:10;stroke-width:50px;}</style></defs><title>More</title><g id="Layer_2" data-name="Layer 2"><g id="More"><rect class="cls-1" x="25" y="25" width="111" height="111"/><rect class="cls-1" x="298.51" y="25" width="111" height="111"/><rect class="cls-1" x="572.51" y="25" width="111" height="111"/></g></g></svg>
                        </div>

                    </div>`

    return content;
}
