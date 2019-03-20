import { Component } from '@stencil/core';



@Component({
    tag: 'plurid-sheet',
    styleUrl: 'sheet.scss',
    shadow: true
})
export class PluridSheet {
    render() {
        return (
            <div>
                <plurid-controls></plurid-controls>
                <slot />
            </div>
        );
    }
}
