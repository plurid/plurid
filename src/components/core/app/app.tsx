import { Component, Element, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-app',
    styleUrl: 'app.scss',
    shadow: true
})
export class PluridApp {
    @Element() element: HTMLElement;
    @Prop() theme: string;

    renderPages = () => {
        const pluridPages = this.element.querySelectorAll('plurid-page');
        const pluridPagesArr = Array.from(pluridPages);
        return (
            <div>
                {pluridPagesArr.map((page: any) => {
                    return (
                        <plurid-sheet innerHTML={page.innerHTML}></plurid-sheet>
                    );
                })}
            </div>
        );
    }

    render() {
        return (
            <plurid-container>
                {this.renderPages()}
            </plurid-container>
        );
    }
}
