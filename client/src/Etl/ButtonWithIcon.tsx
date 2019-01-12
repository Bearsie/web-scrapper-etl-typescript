import Button, { ButtonProps } from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import React from 'react';

type ButtonWithIconProps = ButtonProps & {
    classes: { button: string; rightIcon: string };
    icon: React.ComponentType<SvgIconProps>;
    text: string;
};

export const ButtonWithIcon = withStyles((theme) => ({
    button: {
        margin: '12px',
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
}))
(({ classes, color, disabled, onClick, icon: Icon, text }: ButtonWithIconProps) => (
    <Button
        variant="contained"
        color={color}
        className={classes.button}
        onClick={onClick}
        mini={true}
        disabled={disabled}
    >
        {text}
        <Icon className={classes.rightIcon} />
    </Button>
));
