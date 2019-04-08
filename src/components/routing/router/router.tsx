import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-router',
    styleUrl: 'router.scss',
    shadow: true
})
export class PluridRouter {
    @Prop() domain: string;

    render() {
        return (
            <slot />
        );
    }
}
