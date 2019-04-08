import { Component } from '@stencil/core';



@Component({
    tag: 'plurid-roots',
    styleUrl: 'roots.scss',
    shadow: true
})
export class PluridRoots {
    render() {
        return (
            <plurid-root>
                <slot />
            </plurid-root>
        );
    }
}
