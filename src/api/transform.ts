import express from 'express';
import { map } from 'lodash';
import { ProductDetails } from '../scrapper';
import { transformProductDetails } from '../dataTransformation';
import handleResponse from '../handleResponse';

const transform = express.Router();

/* @route   POST transform/
 * @desc    Transform scrapped product to format that is load into database.
 * @access  Public
 */
transform.post('/', async (req, res) => {
    const data = await Promise.all(
        map(req.body, (product: ProductDetails) => handleResponse(transformProductDetails(product))),
    );

    res.json(data);
});

export { transform };