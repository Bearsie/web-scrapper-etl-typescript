import axios from 'axios';
// import { TransformedOpinion, TransformedProduct } from '../../src/dataTransformation';
// import { ExtractTypes, LoadTypes, SearchTypes, TransformTypes } from '../../src/handleResponse';
// import { Product, ProductDetails } from '../../src/scrapper';

type ExtractTypes = ProductDetails;
type TransformTypes = TransformedProduct;
type LoadTypes = { newProduct: boolean; newOpinions: number; };
type SearchTypes = Product[] | null;

type Product = {
    linkToProduct: string;
    title: string;
};

type ProductDetails = {
    attributes: ProductAttribute[];
    brand: string;
    category: string;
    opinions: Opinion[];
    opinionsAmount: number;
    photo: string;
    productCode: string;
    productId: string;
    productNameId: string;
    title: string;
};

type ProductAttribute = {
    name: string;
    value: string;
};

type Opinion = {
    opinionId: string;
    opinionTitle: string;
    overallRate: Rates;
    grades: Array<{
        attribute: string;
        grade: Rates;
    }>;
    date: string;
    reviewerName: string;
    content: string;
    usefulVotes: string;
    notUsefulVotes: string;
    purchaseConfirmed: boolean;
};

type Rates = 'nieudany' | 'wystarczający' | 'w porządku' | 'dobry' | 'rewelacyjny';

type TransformedProduct = {
    attributes: Array<{
        name: string;
        value: string;
    }>,
    brand: string;
    category: string;
    opinions: TransformedOpinion[];
    photo: string;
    productCode: number;
    productId: number;
    productNameId: string;
    rates: {
        opinionsAmount: number;
        overallRate: number;
        ratedAttributes: RatedAttribute[];
    },
    title: string;
};

type TransformedOpinion = {
    content: string;
    date: {
        day: number;
        month: number;
        year: number;
    };
    grades: Array<{
        attribute: string;
        grade: number;
    }>;
    notUsefulVotes: number;
    opinionId: string;
    opinionTitle: string;
    overallNumericalGrade: number;
    overallVerbalGrade: Rates;
    purchaseConfirmed: boolean;
    reviewerName: string;
    totalUsefulnessVotes: number;
    usefulVotes: number;
    usefulnessRate: number;
};

type RatedAttribute = {
    attributeName: string;
    rates: {
        average: number;
        rated1: number;
        rated2: number;
        rated3: number;
        rated4: number;
        rated5: number;
    };
};

export const searchProducts = async (keyword: string) => (
    await axios.post<{ succeed: true; data: SearchTypes; error?: string; }>('search', { keyword })
).data;

export type ExtractProductResponse = {
    succeed: boolean;
    data: ExtractTypes;
    error?: string;
}

export const extractProductDetails = async (products: Product[]) => (
    await axios.post<ExtractProductResponse[]>('extract', products)
).data;

export type TransformProductResponse = {
    succeed: boolean;
    data: TransformTypes;
    error?: string;
}

export const transformProductDetails = async (productsDetails: ProductDetails[]) => (
    await axios.post<TransformProductResponse[]>('transform', productsDetails)
).data;

export type SaveProductResponse = {
    succeed: boolean;
    data: LoadTypes;
    error?: string;
}

export const saveProducts = async (product: TransformedProduct[]) => (
    await axios.post<SaveProductResponse[]>('load', product)
).data;

export const getProducts = async () => (
    await axios.get<TransformedProduct[]>('products')
).data;

export const updateProduct = async (productId: number) => (
    await axios.patch(`products/${productId}`)
).data;

export const deleteProducts = async () => (
    await axios.delete('products')
).data;

export const deleteProduct = async (productId: number) => (
    await axios.delete(`products/${productId}`)
).data

export const deleteOpinion = async (opinionId: string) => (
    await axios.delete(`opinions/${opinionId}`)
).data;

export type SavedProductInfo = LoadTypes;
export type ProductDetailsType = ProductDetails;
export type ProductType = Product;
export type TransformedProductType = TransformedProduct;
export type TransformedOpinionType = TransformedOpinion;
export type ApiResponse<T> =
    T extends Product ? ExtractProductResponse
    : T extends ProductDetails ? TransformProductResponse
    : T extends TransformedProduct ? SaveProductResponse
    : never;
