import axios from 'axios';
import { get } from 'lodash';

/**
 * Create axios client for base url with error handling.
 *
 * @param baseURL   Base url.
 * @returns     Axios client.
 */
export const createClient = (baseURL: string) => {
    const client = axios.create({ baseURL });

    client.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (!axios.isCancel(error)) {
                console.log(get(error, 'response.data.Message'));
            }
            throw error;
        },
    );

    return client;
};

const euroClient = createClient('https://www.euro.com.pl');

/**
 * Search products on Euro.com.pl that match given keyword.
 *
 * @param searchTerm    Keyword used in search for product.
 * @param pageNumber    Consecutive page number.
 * @returns             Html body.
 */
export const getSearchResultPage = async (searchTerm: string, pageNumber?: number) =>
    euroClient.get<string>(`/search${pageNumber ? `,strona-${pageNumber}` : ''}.bhtml?keyword=${searchTerm}`);

/**
 * Get product page.
 *
 * @param linkToProduct     Url used in requesting for product page.
 * @returns                 Html body.
 */
export const getProductPage = async (linkToProduct: string) => (
    await euroClient.get<string>(linkToProduct)
).data;

/**
 * Get opinion page.
 *
 * @param productNameId     Special name id of product used in requesting for opinions pages.
 * @param page              Consecutive page number.
 * @returns                 Html body.
 */
export const getOpinionPage = async (productNameId: string, page: number) => (
    await euroClient.get<string>(`/product-card-opinion.ltr?product-id=${productNameId}&page_nr=${page}`)
).data;
