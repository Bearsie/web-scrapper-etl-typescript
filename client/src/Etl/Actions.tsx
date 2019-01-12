import { CropRotate, Save, Sync, Transform } from '@material-ui/icons';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import {
    extractProductDetails, ProductDetailsType, ProductType, SavedProductInfo, saveProducts, TransformedProductType,
    transformProductDetails,
} from '../apiRequests'; 
import { ButtonWithIcon } from './ButtonWithIcon';
import EtlAction, { isProductSelected, toProductsContent } from './EtlAction';
import { ProductData } from './index';

export type ActionSummaryResult = { opinionsAmount: number, productsAmount: number};

type ActionSummary<T> = (
    products: T[],
    countOpinions?: (
        opinionsSum: number,
        product: T,
    ) => number,
    countProducts?: (
        productsSum: number,
        product: T,
    ) => number,
) => ActionSummaryResult;

type Props = {
    dataToExtract: Array<ProductData<ProductType>>;
    dataToTransform: Array<ProductData<ProductDetailsType>>;
    dataToLoad: Array<ProductData<TransformedProductType>>;

    onExtractCompleted: (results: ProductDetailsType[], summary: ActionSummaryResult) => void;
    onTransformCompleted: (results: TransformedProductType[], summary: ActionSummaryResult) => void;
    onLoadCompleted: (summary: ActionSummaryResult) => void;

    toggleLoadingStatus: () => void;
};

type State = {
    etlProcessStarted: boolean;
};

class Actions extends Component<Props, State> {
    public state = {
        etlProcessStarted: false,
    };
    
    public render() {

        return (
            <>
                <ButtonWithIcon
                    icon={CropRotate}
                    color="secondary"
                    text="ETL"
                    onClick={this.startETLProcess}
                    disabled={isEmpty(this.props.dataToExtract) || this.state.etlProcessStarted}
                />
                <span style={{ border: '1px dashed gray', margin: '0 5px', padding: '5px 0' }} />
                <EtlAction
                    buttonIcon={Sync}
                    buttonName="Extract"
                    data={this.props.dataToExtract}
                    dataAction={extractProductDetails}
                    onSuccessfullyCompleted={this.passExtractedData}
                    toggleLoadingStatus={this.props.toggleLoadingStatus}
                    isDisabled={this.state.etlProcessStarted}
                />
                <EtlAction
                    buttonIcon={Transform}
                    buttonName="Transform"
                    data={this.props.dataToTransform}
                    dataAction={transformProductDetails}
                    onSuccessfullyCompleted={this.passTransformedData}
                    toggleLoadingStatus={this.props.toggleLoadingStatus}
                    isDisabled={this.state.etlProcessStarted}
                />
                <EtlAction
                    buttonIcon={Save}
                    buttonName="Load"
                    data={this.props.dataToLoad}
                    dataAction={saveProducts}
                    onSuccessfullyCompleted={this.passLoadedData}
                    toggleLoadingStatus={this.props.toggleLoadingStatus}
                    isDisabled={this.state.etlProcessStarted}
                />
            </>
        );
    }

    public componentDidUpdate(prevProps: Props) {
        if (isEmpty(this.props.dataToLoad) && prevProps.dataToLoad !== this.props.dataToLoad) {
            this.setState({ etlProcessStarted: false })
        }
    }

    private startETLProcess = async () => {
        this.setState({ etlProcessStarted: true })
        const dataToExtract = this.props.dataToExtract.filter(isProductSelected).map(toProductsContent);

        this.props.toggleLoadingStatus();

        const extractResponse = await extractProductDetails(dataToExtract);
        const extractedData = extractResponse.map(({ data }) => data);
        this.passExtractedData(extractedData);

        const transformResponse = await transformProductDetails(extractedData);
        const transformedData = transformResponse.map(({ data }) => data);
        this.passTransformedData(transformedData);

        const loadResponse = await saveProducts(transformedData);
        const loadedData = loadResponse.map(({ data }) => data);
        this.passLoadedData(loadedData);
        
        this.props.toggleLoadingStatus();
    }

    private getProductsSummary: ActionSummary<ProductDetailsType | TransformedProductType | SavedProductInfo> = (
        products,
        countOpinions = this.countOpinions,
        countProducts,
    ) => ({
        opinionsAmount: products.reduce(countOpinions, 0),
        productsAmount: countProducts ? products.reduce(countProducts, 0) : products.length,
    });

    private countOpinions = (opinions: number, products: ProductDetailsType | TransformedProductType) =>
        opinions + products.opinions.length;

    private passExtractedData = (products: ProductDetailsType[]) => {
        const extractSummary = this.getProductsSummary(products);
        this.props.onExtractCompleted(products, extractSummary);
    }

    private passTransformedData = (products: TransformedProductType[]) => {
        const transformSummary = this.getProductsSummary(products);
        this.props.onTransformCompleted(products, transformSummary);
    }

    private passLoadedData = (productsInfo: SavedProductInfo[]) => {
        const { countNewOpinions, countNewProducts } = this;
        const loadSummary = this.getProductsSummary(productsInfo, countNewOpinions, countNewProducts);
        this.props.onLoadCompleted(loadSummary);
    }

    private countNewProducts = (products: number, { newProduct }: SavedProductInfo) => products + Number(newProduct);

    private countNewOpinions = (opinions: number, { newOpinions }: SavedProductInfo) => opinions + newOpinions;
}

export default Actions;
