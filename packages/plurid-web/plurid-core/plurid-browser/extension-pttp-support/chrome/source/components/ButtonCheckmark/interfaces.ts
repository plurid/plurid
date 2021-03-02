import {
    Theme,
} from '@plurid/plurid-themes';



export interface ButtonCheckmarkProperties {
    checked: boolean;
    text: string;
    theme: Theme;
    toggle: () => void;
}


export interface ButtonCheckmarkState {
}
