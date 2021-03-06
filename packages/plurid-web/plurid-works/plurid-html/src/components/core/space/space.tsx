import { Component } from '@stencil/core';



@Component({
    tag: 'plurid-space',
    styleUrl: 'space.scss',
    shadow: true
})
export class PluridSpace {

    render() {
        return (
            <plurid-roots>
                <slot />
            </plurid-roots>
        );
    }
}
