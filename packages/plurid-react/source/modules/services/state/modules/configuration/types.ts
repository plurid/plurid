import {
    PluridConfiguration,
} from '@plurid/plurid-data';



export const SET_CONFIGURATION = 'SET_CONFIGURATION';
export interface SetConfigurationAction {
    type: typeof SET_CONFIGURATION;
    payload: PluridConfiguration;
}


export const SET_MICRO = 'SET_MICRO';
export interface SetMicroAction {
    type: typeof SET_MICRO;
}


export interface ConfigurationState extends PluridConfiguration {
}


export type ConfigurationActionsType = SetConfigurationAction
    | SetMicroAction;
