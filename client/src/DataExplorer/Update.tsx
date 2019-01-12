import { Button } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { Update as UpdateIcon } from '@material-ui/icons';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { TransformedProductType, updateProduct } from '../apiRequests';
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';

const styles: StyleRulesCallback = (theme) => ({
    button: {
        fontSize: '10px',
        margin: theme.spacing.unit,
        minHeight: 0,
        minWidth: 0,
        padding: '2px 4px',
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
});

type Props = {
    classes: { [key: string]: string };
    source: TransformedProductType[];
    onUpdate: (data: TransformedProductType[]) => void;
    toggleLoading: () => void;
};

class Update extends Component<Props> {
    public static contextType = NotifyContext;

    public render() {
        const { classes } = this.props;

        return (
            <Button
                variant="contained"
                color="default"
                className={classes.button}
                onClick={this.handleUpdateProduct}
                disabled={isEmpty(this.props.source)}
            >
                Update
                <UpdateIcon fontSize="inherit" className={classes.rightIcon} />
            </Button>
        );
    }

    private handleUpdateProduct = async () => {
        if (isEmpty(this.props.source)) {
            return;
        }

        try {
            this.props.toggleLoading();
            const { products, newOpinions } = await updateProduct(this.props.source[0].productId);
            this.props.onUpdate(products);

            this.context.showNotifier(
                `Product has been updated. New opinions: ${newOpinions}`,
                NotifierType.Success,
            );
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.props.toggleLoading();
        }
    }
}

export default withStyles(styles)(Update);