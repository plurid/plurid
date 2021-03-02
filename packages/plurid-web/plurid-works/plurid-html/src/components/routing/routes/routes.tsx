import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-routes',
    styleUrl: 'routes.scss',
    shadow: true
})
export class PluridRoutes {
    @Prop() subDomain: string;
    @Prop() domain: string;

    render() {
        return (
            <div></div>
        );
    }
}
