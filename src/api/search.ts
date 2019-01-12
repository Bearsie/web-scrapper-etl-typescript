import express from 'express';
import { searchProduct } from '../scrapper';
import handleResponse from '../handleResponse';

const search = express.Router();

/* @route   POST search/
 * @desc    Search product
 * @access  Public
 */
search.post('/', async (req, res) => {
    const { success, data, error } = await handleResponse(searchProduct(req.body.keyword));
    res.status(success ? 200 : 500).json({ success, data, error });
});

export { search };