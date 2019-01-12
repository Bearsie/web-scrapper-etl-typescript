import express, { Request, Response } from 'express';
import { head, map } from 'lodash';
import mongoose from 'mongoose';
import { Opinion, Product, ProductRate, } from '../models';
import { getProductDetails, searchProduct } from '../scrapper';
import { transformProductDetails } from '../dataTransformation';
import { saveProduct } from './load';

const products = express.Router();

export const getProductsWithOpinionsAndRates = async (_req: Request, res: Response) => {
    try {
        const products = await Product.find();
        const productsWithOpinionsAndRates = await Promise.all(map(products, async (product) => {
            const { attributes, brand, category, photo, productCode, productId, productNameId, title } = product;
        
            const opinions = await Opinion.find({ productId: product.productId });
            const rates = await ProductRate.findOne({ productId: product.productId });
        
            return {
                attributes, brand, category, photo, productCode, productId, productNameId, title,
                opinions,
                rates,
            };
        }));
        
        if (res.locals.message) {
            res.json({ ...res.locals.message, products: productsWithOpinionsAndRates });
        } else {
            res.json(productsWithOpinionsAndRates);
        }
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
};

/* @route   GET products/
 * @desc    Get all products
 * @access  Public
 */
products.get('/', getProductsWithOpinionsAndRates);

/* @route   DELETE products/
 * @desc    Delete all products
 * @access  Public
 */
products.delete('/', async (_req, res) => {
    try {
        mongoose.connection.collections.products.drop();
        mongoose.connection.collections.opinions.drop();
        mongoose.connection.collections.productrates.drop();
        console.log('Database cleared!');

        res.json({ succeed: true });
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
});

/* @route    PATCH products/:productId
 * @desc     Update single product
 * @access   Public
 */
products.patch('/:productId', async (req, res, next) => {
    try {
        const product = await Product.findOne({ productId: req.params.productId });

        if (!product) {
            res.status(404).json({ succeed: false, error: `Product with Id: ${req.params.productId} was not found` });
            return;
        }

        const fetchedProduct = head(await searchProduct(String(product.productCode)));
        console.log(fetchedProduct);
        const productDetails = fetchedProduct ? await getProductDetails(fetchedProduct) : fetchedProduct;

        if (!productDetails) {
            res.status(404).json({
                succeed: false,
                error: `Product with Id: ${req.params.productId} was not exists in euro.com.pl database`,
            });
            return;
        }

        const transformedProduct = productDetails ? await transformProductDetails(productDetails) : productDetails;

        const { newOpinions } = await saveProduct(transformedProduct);
        await product.update({ ...transformedProduct });

        res.locals.message = {
            newOpinions,
            success: true,
            updatedProduct: product,
        };

        next();
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
}, getProductsWithOpinionsAndRates);

/* @route    DELETE products/:productId
 * @desc     Delete single product
 * @access   Public
 */
products.delete('/:productId', async (req, res, next) => {
    try {
        const deletedProductDetails = await Product.findOneAndRemove({ productId: req.params.productId })
        const deletedOpinions = await Opinion.remove({ productId: req.params.productId });
        await ProductRate.remove({ productId: req.params.productId });
        console.log('Product deleted!');

        res.locals.message = {
            success: true,
            deletedProductDetails,
            deletedOpinions: deletedOpinions.n,
        };

        next();
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
}, getProductsWithOpinionsAndRates);

export { products };