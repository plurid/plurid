import React, {
    Component,
} from 'react';

import {
    StyledButtonCheckmark,
    StyledButtonCheckmarkCheckbox,
} from './styled';

import {
    ButtonCheckmarkProperties,
    ButtonCheckmarkState,
} from './interfaces';



class ButtonCheckmark extends Component<
    ButtonCheckmarkProperties, ButtonCheckmarkState
> {
    public render() {
        const {
            text,
            toggle,
            checked,
            theme,
        } = this.props;

        return (
            <StyledButtonCheckmark
                onClick={toggle}
            >
                <div>
                    {text}
                </div>

                <StyledButtonCheckmarkCheckbox
                    theme={theme}
                    isChecked={checked}
                />
            </StyledButtonCheckmark>
        );
    }
}


export default ButtonCheckmark;
