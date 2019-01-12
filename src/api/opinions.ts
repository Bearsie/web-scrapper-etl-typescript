import express from 'express';
import { get, map, mean, round } from 'lodash';
import mongoose from 'mongoose';
import { Opinion, OpinionType, ProductRate } from '../models';
import { getProductsWithOpinionsAndRates } from './products';

const opinions = express.Router();

/* @route   GET opinions/
 * @desc    Get all opinions
 * @access  Public
 */
opinions.get('/', async (_req, res) => {
    try {
        const opinions = await Opinion.find();
        res.json(opinions);
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
});

/* @route   DELETE opinions/
 * @desc    Delete all opinions
 * @access  Public
 */
opinions.delete('/', async (_req, res) => {
    try {
        mongoose.connection.collections.opinions.drop();
        console.log('Opinions cleared!');
        mongoose.connection.collections.productrates.drop();
        console.log('Product rates summary cleared!')
        res.json({ succeed: true });
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
});

/* @route    DELETE opinions/:opinionId
 * @desc     Delete single opinion
 * @access   Public
 */
opinions.delete('/:opinionId', async (req, res, next) => {
    try {      
        const deletedOpinion = await Opinion.findOneAndDelete({ opinionId: req.params.opinionId });

        if (!deletedOpinion) {
            res.status(404).json({ succeed: false, error: `Opinion with Id: ${req.params.opinionId} was not found` });
            return;
        }

        console.log('Opinion deleted!');

        await updateProductRatesSummary(deletedOpinion);
        console.log('Product rates summary updated!');
        
        res.locals.message = { succeed: true };

        next();
    } catch (error) {
        console.log(error.stack);
        res.status(500).json({ succeed: false, error: `An error has occured: ${error.message}` });
    }
}, getProductsWithOpinionsAndRates);

const updateProductRatesSummary = async (deletedOpinion: OpinionType) => {
    const currentProductRate = await ProductRate.findOne({ productId: deletedOpinion.productId });

    const deletedGrades = map(get(deletedOpinion, 'grades'), (grade) => get(grade, 'grade'));
    const currentOpinionsAmount = get(currentProductRate, 'opinionsAmount', 0);
    const newOpinionsAmount = minZero(currentOpinionsAmount - 1);

    const newRatedAttributes = map(get(currentProductRate, 'ratedAttributes'), (attribute, index) => {
        const currentRates = get(attribute, 'rates');
        const removedGradeOfAttribute = get(deletedGrades, `[${index}]`);
        const newAttributeRatesAmount = minZero(get(currentRates, `rated${removedGradeOfAttribute}`) - 1);
        const currentAverage = get(attribute, 'rates.average');
        const newAverage = newOpinionsAmount
            ? round((currentAverage * currentOpinionsAmount - removedGradeOfAttribute) / newOpinionsAmount, 2)
            : 0;
        const changedRates = {
            [`rated${removedGradeOfAttribute}`]: newAttributeRatesAmount,
            average: newAverage,
        };
        const newRates = Object.assign({}, currentRates, changedRates);

        return Object.assign(attribute, { rates: newRates });
    });

    const newOverallRate = round(mean(map(newRatedAttributes, (attribute) => attribute.rates.average)), 2);

    if (currentProductRate) {
        await currentProductRate.update(
            {
                opinionsAmount: newOpinionsAmount,
                overallRate: newOverallRate,
                ratedAttributes: newRatedAttributes,
            },
        );
    }
}

const minZero = (value: number) => value < 0 ? 0 : value;

export { opinions };