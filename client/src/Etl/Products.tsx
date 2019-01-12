import { Checkbox, List, ListItem, ListItemSecondaryAction, ListItemText }  from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { map } from 'lodash';
import React from 'react';
import { ProductDetailsType, ProductType, TransformedProductType } from '../apiRequests';
import { AvatarWithBadge } from './AvatarWithBadge';
import { ProductData } from './index';

type ProductsProps = {
    badge?: (product: ProductData) => string;
    classes: { [className: string]: string };
    completed?: boolean;
    data:  Array<{
        content: ProductType | ProductDetailsType | TransformedProductType;
        isSelected: boolean;
        nameId: string;
    }>;
    icon: React.ComponentType<SvgIconProps>;
    loading: boolean;
    onToggleCheckbox: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Products = withStyles({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    list: {
        maxWidth: 600,
        width: '100%',
    },
})
(({ badge, classes, completed = false, data, icon, loading, onToggleCheckbox }: ProductsProps) => (
    <div className={classes.container}>
        <List dense={true} className={classes.list}>
            {map(data, (product) => (
                <ListItem
                    button={true}
                    divider={true}
                    key={`${product.nameId}`}
                >
                    <AvatarWithBadge 
                        isProductSelected={product.isSelected}
                        badge={badge ? badge(product) : ''}
                        {...{ completed, icon, loading }}
                    />

                    <ListItemText primary={product.content.title} />

                    <ListItemSecondaryAction>
                        <Checkbox
                            checked={product.isSelected}
                            disabled={loading || completed}
                            id={product.nameId}
                            onChange={onToggleCheckbox}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    </div>
));
