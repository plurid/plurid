import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-route',
    styleUrl: 'route.scss',
    shadow: true
})
export class PluridRoute {
    @Prop() page: string;

    render() {
        // console.log('Route to', this.page);

        return (
            <div></div>
        );
    }
}
