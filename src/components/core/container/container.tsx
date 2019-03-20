import { Component } from '@stencil/core';



@Component({
    tag: 'plurid-container',
    styleUrl: 'container.scss',
    shadow: true
})
export class PluridContainer {

    render() {
        return (
            <div>
                <plurid-space>
                    <slot />
                </plurid-space>

                <plurid-options></plurid-options>
                <plurid-viewcube></plurid-viewcube>
            </div>
        );
    }
}
