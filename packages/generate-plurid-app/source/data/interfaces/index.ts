export interface Question {
    type: string;
    name: string;
    message: string;
    choices?: any[];
}


export interface Answers {
    directory: string;
    language: string;
    ui: string;
    type: string;
    manager: string;
}
