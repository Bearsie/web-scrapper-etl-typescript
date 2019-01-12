import { Button } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import {
    deleteOpinion, deleteProduct, deleteProducts, TransformedOpinionType, TransformedProductType,
} from '../apiRequests';
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';
import { DataType } from './Download';

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
    data: DataType;
    source: TransformedProductType[] | TransformedOpinionType;
    onDelete: (data: TransformedProductType[] | TransformedOpinionType) => void;
    toggleLoading: () => void;
};

class Delete extends Component<Props> {
    public static contextType = NotifyContext;

    public render() {
        const { classes } = this.props;

        return (
            <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                onClick={this.props.data === DataType.Opinion ? this.handleDeleteOpinion
                    : this.props.data === DataType.Product ? this.handleDeleteProduct
                    : this.handleDeleteAllData}
                disabled={isEmpty(this.props.source)}
            >
                Delete
                <Close fontSize="inherit" className={classes.rightIcon} />
            </Button>
        );
    }

    private handleDeleteAllData = async () => {  
        if (isEmpty(this.props.source)) {
            return;
        }

        try {
            this.props.toggleLoading();
            await deleteProducts();
            this.props.onDelete([]);

            this.context.showNotifier(
                `All data has been cleared.`,
                NotifierType.Success,
            );
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.props.toggleLoading();
        }
    }

    private handleDeleteOpinion = async () => { 
        if (isEmpty(this.props.source)) {
            return;
        }

        try {
            this.props.toggleLoading();
            const { products } = await deleteOpinion(this.props.source[0].opinionId);
            this.props.onDelete(products);

            this.context.showNotifier(
                `Opinion has been deleted.`,
                NotifierType.Success,
            );
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.props.toggleLoading();
        }
    }

    private handleDeleteProduct = async () => {    
        if (isEmpty(this.props.source)) {
            return;
        }

        try {
            this.props.toggleLoading();
            const { products, deletedOpinions } = await deleteProduct(this.props.source[0].productId);
    
            this.props.onDelete(products);

            this.context.showNotifier(
                `Product has been deleted. Deleted opinions: ${deletedOpinions}`,
                NotifierType.Success,
            );
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.props.toggleLoading();
        }
    }
}

export default withStyles(styles)(Delete);