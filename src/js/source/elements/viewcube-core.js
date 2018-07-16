export function renderViewcube(container) {
    const viewcube = document.createElement("plurid-viewcube");
    container.appendChild(viewcube);
}

export function contentViewcube(container) {
    return `
        <div class="plurid-viewcube-container">
            <div class="plurid-viewcube-scale-container">
                <input type="range">
            </div>

            <div class="plurid-viewcube-rotate-left-container">
                &#x25c0;
            </div>

            <div class="plurid-viewcube-rotate-right-container">
                &#x25b6;
            </div>

            <div class="plurid-viewcube-rotate-up-container">
                &#x25B2;
            </div>

            <div class="plurid-viewcube-rotate-down-container">
                &#x25BC;
            </div>

            <div class="plurid-viewcube-model-container">
                <div class="plurid-viewcube-model-transform-container">
                    <div class="plurid-viewcube-model-transform-cube">
                        <div class="plurid-viewcube-model-transform-front">
                            <div class="plurid-viewcube-model-transform-text">
                                Front
                            </div>
                        </div>
                        <div class="plurid-viewcube-model-transform-left">
                            <div class="plurid-viewcube-model-transform-text">
                                Left
                            </div>
                        </div>
                        <div class="plurid-viewcube-model-transform-back">
                            <div class="plurid-viewcube-model-transform-text">
                                Back
                            </div>
                        </div>
                        <div class="plurid-viewcube-model-transform-right">
                            <div class="plurid-viewcube-model-transform-text">
                                Right
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="plurid-viewcube-translate-y-container">
                <input type="range" orient="vertical">
            </div>

            <div class="plurid-viewcube-translate-x-container">
                <input type="range">
            </div>

            <div class="plurid-viewcube-fitview-container">
                &#8281;
            </div>
        </div>
    `;
}
