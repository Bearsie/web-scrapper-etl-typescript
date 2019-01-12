import { IconButton, Snackbar, SnackbarContent } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { CheckCircle as CheckIcon, Close, Error as ErrorIcon } from '@material-ui/icons';
import React, { PureComponent } from 'react';
import { NotifierType } from './index';

const variantIcon = {
    error: ErrorIcon,
    success: CheckIcon,
};

const styles: StyleRulesCallback = (theme) => ({
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        marginRight: theme.spacing.unit,
        opacity: 0.9,
    },
    margin: {
        margin: theme.spacing.unit,
    },
    message: {
        alignItems: 'center',
        display: 'flex',
    },
    success: {
        backgroundColor: green[600],
    },
});

type Props = {
    classes: { [key: string]: string };
    message: string;
    onClose: () => void;
    open: boolean;
    type: NotifierType;
};

class Notifier extends PureComponent<Props> {
    public render() {
        const { classes, message, open, type } = this.props;
        const Icon = variantIcon[type];
    
        return (
            <Snackbar
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'top',
                }}
                open={open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <SnackbarContent
                    className={`${classes[type]} ${classes.margin}`}
                    message={
                        <span id="client-snackbar" className={classes.message} >
                            <Icon className={`${classes.icon} ${classes.iconVariant}`} />
                            {message}
                        </span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleClose}
                        >
                            <Close className={classes.icon} />
                        </IconButton>,
                    ]}
                />
            </Snackbar>
        );
    }

    private readonly handleClose = () => {
        this.props.onClose();
    }
}

export default withStyles(styles)(Notifier);
