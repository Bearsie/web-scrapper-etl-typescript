import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { ApiResponse, ProductDetailsType, SavedProductInfo, TransformedProductType } from '../apiRequests';
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';
import { ButtonWithIcon } from './ButtonWithIcon';
import { ProductData, ProductForm } from './index';

export type DataAction<T> = (products: T[]) => Promise<Array<ApiResponse<T>>>;

type Props<T> = {
    buttonIcon: React.ComponentType<SvgIconProps>;
    buttonName: string;
    data: Array<{
        content: T;
        isSelected: boolean;
        nameId: string;
    }>;
    dataAction: DataAction<T>;
    onSuccessfullyCompleted: (
        resultProducts: Array<ProductDetailsType | TransformedProductType | SavedProductInfo>,
    ) => void;
    toggleLoadingStatus: () => void;
    isDisabled: boolean;
};

type State = {
    disabled: boolean;
};

class EtlAction<T extends ProductForm> extends Component<Props<T>, State> {
    public static contextType = NotifyContext;

    public state = {
        disabled: false,
    };

    public render() {
        return (
            <ButtonWithIcon
                color="default"
                disabled={isEmpty(this.props.data) || this.state.disabled || this.props.isDisabled}
                icon={this.props.buttonIcon}
                onClick={this.handleClick}
                text={this.props.buttonName}
            />
        );
    }

    public componentDidUpdate(prevProps: Props<T>) {
        if (isEmpty(this.props.data) && prevProps.data !== this.props.data) {
            this.setState({ disabled: false })
        }
    }

    private handleClick = async () => {
        this.setState({ disabled: true });

        this.props.toggleLoadingStatus();
        try {
            const response = await this.dataAction();

            const data = response.map(toData);
            this.props.onSuccessfullyCompleted(data);
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.props.toggleLoadingStatus();
        }
    }

    private dataAction = async () => {
        const productsContent = this.props.data.filter(isProductSelected).map(toProductsContent);

        return await this.props.dataAction(productsContent);
    }
}

export const isProductSelected = <T extends ProductForm>(product: ProductData<T>) => product.isSelected;

export const toProductsContent = <T extends ProductForm>(product: ProductData<T>) => product.content;

const toData = <T extends ProductForm>(response: ApiResponse<T>) => response.data;

export default EtlAction;