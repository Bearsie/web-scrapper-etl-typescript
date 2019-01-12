import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { get } from 'lodash';
import React from 'react';
import { ProductDetailsType, ProductType, TransformedProductType } from '../apiRequests';
import { ProductData } from './index';
import { Products } from './Products';

type Props = {
    showBadge: boolean;
    showCompleted?: boolean;
    icon: React.ComponentType<SvgIconProps>;
    loading: boolean;
    onChangeSelection: (nameId: string, selection: boolean) => void;
    data: Array<{
        content: ProductType | ProductDetailsType | TransformedProductType;
        isSelected: boolean;
        nameId: string;
    }>;
};
  
class Results extends React.Component<Props> {
    public render() {
        return (
            <Products
                badge={this.props.showBadge ? this.setBadge : undefined}
                completed={this.props.showCompleted}
                data={this.props.data}
                icon={this.props.icon}
                loading={this.props.loading}
                onToggleCheckbox={this.toggleChecked}
            />
        );
    }

    private toggleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChangeSelection(event.target.id, event.target.checked);
    }

    private setBadge = (product: ProductData) => get(product.content, 'opinions.length')
}

export default Results;
