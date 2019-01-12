import * as cheerio from 'cheerio';
import { concat, head, nth, reduce } from 'lodash';
import { getOpinionPage, getProductPage, getSearchResultPage } from './requests';

type SearchProduct = (searchTerm: string) => Promise<Product[] | null>;

/**
 * Fetch and parse products that matches given keyword.
 *
 * ### Example
 * ```js
 * const products = await searchProduct('samsung galaxy xcover 4');
 * console.log(products[0])
 * // => {
 * //        linkToProduct: 'telefony-komorkowe/samsung-galaxy-xcover-4.bhtml',
 * //        title: 'Samsung Galaxy Xcover 4',
 * //    }
 * ```
 *
 * @param searchTerm   Keyword used in search for product.
 * @returns            Products that matches keyword.
 */
export const searchProduct: SearchProduct = async (searchTerm: string) => {
    const { data: body, request, /*config*/ } = await getSearchResultPage(searchTerm);

    const $ = cheerio.load(body);
    //const onlyOneProductMatchSearchTerm = decodeURI(request.res.responseUrl) !== config.url;
    const noProductsFound = $('body').find('.product-box').is('.product-box');

    if (!noProductsFound) {
        return null;
    }
/*
    if (onlyOneProductMatchSearchTerm) {
        return [{
            linkToProduct: request.res.req.path,
            title: $('div.product-header').find('h1').text().trim(),
        }];
    }
*/
    const lastResultPage = Number($('.paging').find('.paging-number').last().text().trim());

    return lastResultPage
        ? getMultipleSearchResultPages(searchTerm, lastResultPage)
        : $('div.product-box')
            .map((_, element) => {
                const linkToProduct = $(element).attr('data-product-href');
                const title = $(element).find('.product-main h2.product-name a').text().trim();

                return ({
                    linkToProduct: linkToProduct ? linkToProduct : request.res.req.path,
                    title: title ? title : $('div.product-header').find('h1').text().trim(),
                })
            })
            .get();
};

/**
 * Fetch and parse products that matches given keyword from multiple result pages.
 *
 * @param searchTerm   Keyword used in search for product.
 * @param lastPage   Last result page.
 * @param startPage   Second result page.
 * @returns     Products that matches keyword.
 */
const getMultipleSearchResultPages = async (searchTerm: string, lastPage: number, startPage = 1) => {
    const results = [];

    for (let page = startPage; page <= lastPage; page+= 1) {
        const newProducts = getSearchResultPage(searchTerm, page);
        results.push(newProducts);
    }

    return reduce(await Promise.all(results), (all, result) => {
        const $ = cheerio.load(result.data);
        const products = $('div.product-box')
            .map((_, element) => ({
                linkToProduct: $(element).attr('data-product-href'),
                title: $(element).find('.product-main h2.product-name a').text().trim(),
            }))
            .get();

        return concat(all, products);
    }, []);
};

export type Product = {
    linkToProduct: string;
    title: string;
};

type GetProductDetails = (product: Product) => Promise<ProductDetails>;

export type ProductDetails = {
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

export type ProductAttribute = {
    name: string;
    value: string;
};

/**
 * Go to the product page and fetch asynchronously and parse additional data and opinions for selected Product.
 *
 * @param product   Product.
 * @returns         Product's details with opinions.
 */
export const getProductDetails: GetProductDetails = async ({ linkToProduct }) => {
    const body = await getProductPage(linkToProduct);
    const product = await scrapeProductPage(body, linkToProduct);

    return product;
};

/**
 * Parse product page and fetch opinions asynchronously.
 *
 * @param body   Content of the product page.
 * @param linkToProduct   Link to get opinions.
 * @returns         Product's details with opinions.
 */
export const scrapeProductPage = async (body: string, linkToProduct: string) => {
    const $ = cheerio.load(body);
    const $product = $('#product-top > div.product-main');
    const $productHeader = $product.find('div.product-header');
    const productNameId = nth(linkToProduct.match(/\/([\da-z-]+)\./), 1)!;
    const lastOpinionPage = Number($('.paging').find('.paging-number').last().text().trim());
    const opinions = $('div').is('#opinion-list-empty') ? [] : await getOpinions(productNameId, lastOpinionPage);

    return {
        attributes: $product
            .find('div.product-info .product-attributes .attributes-row')
            .map((_, element) => {
                const nameInLink = $(element).find('.attribute-name').has('a').text().trim();

                return {
                    name: nameInLink ? nameInLink : $(element).find('.attribute-name').text().trim(),
                    value: $(element).find('.attribute-value').text().trim(),
                }
            }).get() as ProductAttribute[],
        brand: $productHeader.find('.product-brand').attr('title'),
        category: $productHeader.find('.product-category a').attr('title'),
        opinions,
        opinionsAmount: opinions.length,
        photo: $product.find($('div#product-photo a')).attr('href'),
        productCode: head($productHeader
            .find('.product-code .selenium-product-code')
            .first().contents()
            .filter(function() { return this.type === 'text'})
            .text().match(/\d+/))!,
        productId: $('#product-top').attr('data-product'),
        productNameId,
        title: $productHeader.find('h1').text().trim(),
    };
};

export type Rates = 'nieudany' | 'wystarczający' | 'w porządku' | 'dobry' | 'rewelacyjny';

export type Opinion = {
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

/**
 * Extract opinions form single or multiple opinion pages.
 *
 * @param productNameId   Product name id used for fetch opinion page.
 * @param lastPage   FLast opinion page.
 * @param startPage   First opinion page.
 * @returns     Formatted opinions from all opinion pages.
 */
const getOpinions = async (productNameId: string, lastPage: number, startPage = 1) => {
    if (!lastPage) {
        return await scrapeOpinionsFromPage(startPage, productNameId);
    }

    const opinions = [];

    for (let page = startPage; page <= lastPage; page+= 1) {
        const newOpinions = scrapeOpinionsFromPage(page, productNameId);
        opinions.push(newOpinions);
    }

    return reduce(await Promise.all(opinions), (all, pageOpinions) => concat(all, pageOpinions), []);
};

/**
 * Fetch and parse opinions from given page.
 *
 * @param page   Opinion page.
 * @param productNameId   Product name id used for fetch opinion page.
 * @returns     Formatted opinions.
 */
const scrapeOpinionsFromPage = async (page: number, productNameId: string) => {
    const body = await getOpinionPage(productNameId, page);
    const $ = cheerio.load(body);

    return $('#opinion-list .opinion-item')
        .map((_, element) => ({
            content: $(element)
                .find($('.opinion-content .opinion-text p'))
                .text().trim(),
            date: $(element)
                .find($('.opinion-item-header-info .opinion-additional-info .opinion-date'))
                .text().trim(),
            grades: $(element)
                .find('.opinion-item-header-info .opinion-stars .opinion-item-grades .grade-item')
                .map((_, item) => ({ // tslint:disable-line
                    attribute: $(item).find($('.attribute')).text().trim(),
                    grade: $(item).find($('.stars-rating')).attr('title'),
                }))
                .get(),
            notUsefulVotes: head($(element)
                .find($('.opinion-content .opinion-useful .rate-box .opinion-helpful-no-number'))
                .text().trim().match(/\d+/))!,
            opinionId: $(element).attr('id'),
            opinionTitle: $(element)
                .find($('.opinion-item-header-info .opinion-title'))
                .text().trim(),
            overallRate: $(element)
                .find($('.opinion-item-header-info .opinion-stars .js-opinion-stars'))
                .attr('title'),
            purchaseConfirmed: $(element)
                .find($('.opinion-item-header-info .opinion-additional-info .opinion-item-header-images'))
                .contents().is('.customer-confirmed'),
            reviewerName: $(element)
                .find($('.opinion-item-header-info .opinion-additional-info .opinion-nick'))
                .text().trim(),
            usefulVotes: head($(element)
                .find($('.opinion-content .opinion-useful .rate-box .opinion-helpful-yes-number'))
                .text().trim().match(/\d+/))!,
        })).get();
}
