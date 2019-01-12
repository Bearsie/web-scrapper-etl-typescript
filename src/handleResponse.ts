import { TransformedProduct } from './dataTransformation';
import { Product, ProductDetails } from './scrapper';

export type ExtractTypes = ProductDetails;
export type TransformTypes = TransformedProduct;
export type LoadTypes = { newProduct: boolean; newOpinions: number; };
export type SearchTypes = Product[] | null;

/**
 * Handles async requests, so that in case of error sends back error without crashing the app.
 *
 * @param promise     Promise to handle.
 * @returns           Data sends to the client.
 */
export default <T extends SearchTypes | ExtractTypes | TransformTypes | LoadTypes>(promise: Promise<T>) => promise
    .then((data: T) => ({ success: true, data, error: undefined }))
    .catch((error) => Promise.resolve({
        data: undefined,
        error: `An error has occured: ${error.message}`,
        success: false,
    }));