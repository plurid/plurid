import {
    DEFAULT_RENDERER_STORE,
    DEFAULT_RENDERER_SCRIPT,
} from '../../data/constants';

import {
    PluridRendererConfiguration,
} from '../../data/interfaces';

import template from './template';



export default class PluridRenderer {
    private head: string;
    private content: string;
    private store: string;
    private root: string;
    private script: string;

    constructor(
        configuration: PluridRendererConfiguration,
    ) {
        const {
            head,
            content,
            store,
            root,
            script,
        } = configuration;

        this.head = head;
        this.content = content;
        this.store = this.safeStore(store) || DEFAULT_RENDERER_STORE;
        this.root = root || 'root',
        this.script = script || DEFAULT_RENDERER_SCRIPT;
    }

    public html() {
        return template(
            this.head,
            this.content,
            this.store,
            this.root,
            this.script,
        );
    }

    private safeStore(
        store: string,
    ): string {
        return store.replace(
            /</g,
            '\\u003c'
        );
    }
}
