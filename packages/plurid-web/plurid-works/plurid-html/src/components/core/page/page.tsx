import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-page',
    styleUrl: 'page.scss',
    shadow: true
})
export class PluridPage {
    @Prop() name: string;
    @Prop() pageTitle: string;

    render() {
        return (
            <div>
                <slot />
            </div>
        );
    }
}
