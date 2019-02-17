import * as React from 'react';

import MaterialButton, { ButtonProps as MaterialButtonProps } from '@material-ui/core/Button';

import Reveal from '../reveal/Reveal';

import styles from './styles/Button.module.css';

export interface ButtonProps extends MaterialButtonProps {

}

const Button: React.SFC<ButtonProps> = (props) => {
  return (
    <div>
      <MaterialButton className={styles.button} {...props} disableRipple disableFocusRipple>
        <Reveal />
        {props.children}
      </MaterialButton>
    </div>
  );
}
//
export default Button;