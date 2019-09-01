import {
    PluridAppConfiguration,
} from '../../../../data/interfaces';



export const SET_CONFIGURATION = 'SET_CONFIGURATION';

export interface SetConfigurationAction {
    type: typeof SET_CONFIGURATION;
    payload: PluridAppConfiguration;
}


export interface ConfigurationState extends PluridAppConfiguration {
}


export type ConfigurationActionsType = SetConfigurationAction;
