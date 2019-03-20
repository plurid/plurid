import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-page',
    styleUrl: 'page.scss',
    shadow: true
})
export class PluridPage {
    @Prop() name: string;
    @Prop() title: string;

    render() {
        return (
            <div>PluridPage</div>
        );
    }
}
