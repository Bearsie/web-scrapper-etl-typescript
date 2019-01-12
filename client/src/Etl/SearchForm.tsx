import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { Search as SearchIcon } from '@material-ui/icons';
import React from 'react';
import { ButtonWithIcon } from './ButtonWithIcon';

type SearchFormProps = TextFieldProps & {
    classes: { center: string; textField: string };
    isSearchPending: boolean;
    onSubmit: React.FormEventHandler;
}

export const SearchForm = withStyles((theme) => ({
    center: {
        textAlign: 'center',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 430,
    },
}))
(({ classes, isSearchPending, label, onChange, onSubmit, placeholder, value }: SearchFormProps) => (
    <div className={classes.center}>
        <form className={classes.center} onSubmit={onSubmit} noValidate={true} autoComplete="off">
            <TextField
                id="search"
                label={label}
                className={classes.textField}
                value={value}
                onChange={onChange}
                margin="normal"
                placeholder={placeholder}
                autoFocus={true}
            />
            <ButtonWithIcon
                color="primary"
                icon={SearchIcon}
                onClick={onSubmit}
                text="Search"
            />
        </form>
        {isSearchPending && <CircularProgress />}
    </div>
));
