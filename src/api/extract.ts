import express from 'express';
import { map } from 'lodash';
import { getProductDetails, Product } from '../scrapper';
import handleResponse from '../handleResponse';

const extract = express.Router();

/* @route   GET extract/
 * @desc    Extract product details
 * @access  Public
 */
extract.post('/', async (req, res) => {
    const data = await Promise.all(
        map(req.body, (product: Product) => handleResponse(getProductDetails(product))),
    );

    res.json(data);
});

export { extract };