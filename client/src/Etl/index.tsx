import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { Done } from '@material-ui/icons';
import SaveIcon from '@material-ui/icons/Save';
import ExtractIcon from '@material-ui/icons/Sync';
import TransformIcon from '@material-ui/icons/Transform';
import { get, isEmpty, map, split } from 'lodash';
import React, { Component } from 'react';
import { ProductDetailsType, ProductType, TransformedProductType } from '../apiRequests'; 
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';
import Actions, { ActionSummaryResult } from './Actions';
import Results from './Results';
import Search from './Search';

const styles: StyleRulesCallback = () => ({
    root: {
        textAlign: 'center',
    },
});

type Props = {
    classes: { [key: string]: string };
};

export type ProductForm = ProductType | ProductDetailsType | TransformedProductType;

export type ProductData<T = ProductForm> = {
    content: T;
    isSelected: boolean;
    nameId: string;
};

type DataType = 'searchData' | 'extractData' | 'transformData';

type UpdateData<T> = (
    dataName: string,
    products: T[],
    isSelected?: (product: T) => boolean,
) => Array<ProductData<T>>;

type State = {
    extractData: Array<ProductData<ProductDetailsType>>;
    loading: boolean;
    savedData: Array<ProductData<TransformedProductType>>;
    searchData: Array<ProductData<ProductType>>;
    transformData: Array<ProductData<TransformedProductType>>;
};

const initialState = {
    extractData: [],
    loading: false,
    savedData: [],
    searchData: [],
    transformData: [],
};

class Etl extends Component<Props, State> {
    public static contextType = NotifyContext;
    public state = initialState;
    
    public render() {

        return (
            <div className={this.props.classes.root}>
                <Actions
                    dataToExtract={this.state.searchData}
                    onExtractCompleted={this.setProductsDetails}
                    dataToTransform={this.state.extractData}
                    onTransformCompleted={this.setTransformedProducts}
                    dataToLoad={this.state.transformData}
                    onLoadCompleted={this.setSavedProducts}
                    toggleLoadingStatus={this.handleToggleLoadingStatus}
                />
                <Search setProducts={this.setProducts} resetEtl={this.resetEtl} />
                {!isEmpty(this.state.searchData) &&
                    <Results
                        data={this.state.searchData}
                        loading={this.state.loading}
                        onChangeSelection={this.handleChangeSelection}
                        showBadge={false}
                        icon={ExtractIcon}
                    />
                }
                {!isEmpty(this.state.extractData) &&
                    <Results
                        data={this.state.extractData}
                        loading={this.state.loading}
                        onChangeSelection={this.handleChangeSelection}
                        showBadge={true}
                        icon={TransformIcon}
                    />
                }
                {!isEmpty(this.state.transformData) &&
                    <Results
                        data={this.state.transformData}
                        loading={this.state.loading}
                        onChangeSelection={this.handleChangeSelection}
                        showBadge={true}
                        icon={SaveIcon}
                    />
                }
                {!isEmpty(this.state.savedData) &&
                    <Results
                        data={this.state.savedData}
                        loading={this.state.loading}
                        onChangeSelection={this.handleChangeSelection}
                        showBadge={true}
                        showCompleted={true}
                        icon={Done}
                    />
                }
            </div>
        );
    }

    private resetEtl = () => {
        this.setState(initialState);
    }

    private handleToggleLoadingStatus = () => {
        this.setState(({ loading }) => ({ loading: !loading }));
    }

    private getUpdatedData: UpdateData<ProductForm> = (
        dataName,
        products,
        isSelected,
    ) => {
        return map(products, (product, index) => ({
            content: product,
            isSelected: isSelected ? isSelected(product) : true,
            nameId: `${dataName}-${product.title}-${index}`,
        }));
    }

    private setProducts = (products: ProductType[]) => {
        const newData = this.getUpdatedData('searchData', products);
        this.setState(this.updateState('searchData', newData));
    }

    private setProductsDetails = (
        products: ProductDetailsType[],
        { opinionsAmount, productsAmount }: ActionSummaryResult,
    ) => {
        const newData = this.getUpdatedData('extractData', products, this.hasProductOpinions);
        this.setState(this.updateState('extractData', newData));
        this.setState(this.updateState('searchData', []));
        
        this.context.showNotifier(
            `Extracted ${opinionsAmount} opinions of ${productsAmount} products.`,
            NotifierType.Success,
        );
    }

    private setTransformedProducts = (
        products: TransformedProductType[],
        { opinionsAmount, productsAmount }: ActionSummaryResult,
    ) => {
        const newData = this.getUpdatedData('transformData', products);
        this.setState(this.updateState('transformData', newData));
        this.setState(this.updateState('extractData', []));
        
        this.context.showNotifier(
            `Transformed ${opinionsAmount} opinions of ${productsAmount} products.`,
            NotifierType.Success,
        );
    }

    private setSavedProducts = ({ opinionsAmount, productsAmount }: ActionSummaryResult) => {
        this.setState((state) => ({
            savedData: state.transformData,
            transformData: [],
        }));
    
        this.context.showNotifier(
            `Loaded new products: ${productsAmount}. Loaded new opinions: ${opinionsAmount}.`,
            NotifierType.Success,
        );
    }

    private handleChangeSelection = (nameId: string, isSelected: boolean) => {
        const dataName = split(nameId, '-')[0] as DataType;

        this.setState((state) => ({
            extractData: state.extractData,
            loading: state.loading,
            savedData: state.savedData,
            searchData: state.searchData,
            transformData: state.transformData,
            [dataName]: map(state[dataName], (productData) =>
                get(productData, 'nameId') === nameId ? Object.assign({}, productData, { isSelected }) : productData
            ),
        }));
    }

    private updateState = <T extends any>(dataName: keyof State, value: T) =>
    ({ extractData, savedData, searchData, transformData, loading }: State): State => ({
        extractData,
        loading,
        savedData,
        searchData,
        transformData,
        [dataName]: value,
    })

    private hasProductOpinions = (product: ProductDetailsType) => product.opinionsAmount !== 0
}

export default withStyles(styles)(Etl);
