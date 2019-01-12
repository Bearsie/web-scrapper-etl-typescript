import express from 'express';
import { filter, map, size, some } from 'lodash';
import { Opinion, Product, ProductRate } from '../models';
import { TransformedProduct } from '../dataTransformation';
import handleResponse from '../handleResponse';

const load = express.Router();

export const saveProduct = async (data: TransformedProduct) => {
    const {
        attributes, brand, category, opinions, photo, productCode, productId, productNameId, rates, title,
    } = data;

    const foundProduct = await Product.findOne({ productId });
    
    const product = foundProduct ? foundProduct : new Product({
        attributes, brand, category, photo, productCode, productId, productNameId, title,
    });
    const isNewProduct = product.isNew;

    if (isNewProduct) {
        await product.save();
    }

    const areNewOpinions = await Promise.all(map(opinions, async (opinion) => {
        const foundOpinion = await Opinion.findOne({ opinionId: opinion.opinionId });
        const opinionWithId = foundOpinion ? foundOpinion : new Opinion({
            ...opinion,
            productId: product.productId,
        });

        if (opinionWithId.isNew) {
            await opinionWithId.save();
            return true;
        }

        return false;
    }));

    const foundProductRates = await ProductRate.findOne({ productId: product.productId });
    const ratesWithId = foundProductRates ? foundProductRates : new ProductRate({
        ...rates,
        productId: product.productId,
    });

    if (ratesWithId.isNew) {
        await ratesWithId.save();
    } else if (some(areNewOpinions)) {
        ratesWithId.update({ ...rates }).exec();
    }

    return {
        newProduct: isNewProduct,
        newOpinions: size(filter(areNewOpinions)),
    };
};

/* @route   GET load/
 * @desc    Save product, opinions, rates into the database
 * @access  Public
 */
load.post('/', async (req, res) => {
    const data = await Promise.all(
        map(req.body, (product: TransformedProduct) => handleResponse(saveProduct(product))),
    );

    res.json(data);
});

export { load };