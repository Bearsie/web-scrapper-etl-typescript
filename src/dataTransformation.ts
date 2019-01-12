import { compact, filter, get, isEmpty, map, nth, reduce, round, split, sum, toNumber, trimEnd } from 'lodash';
import { Opinion, ProductDetails, Rates } from './scrapper';

export type TransformedProduct = {
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

export type TransformedOpinion = {
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

export const transformProductDetails = async (productDetails: ProductDetails): Promise<TransformedProduct> => {
    const opinions = get(productDetails, 'opinions');
    const opinionsAmount = get(productDetails, 'opinionsAmount');

    const firstRatedAttribute = getRatesForAttribute(0, opinions, opinionsAmount);
    const secondRatedAttributes = getRatesForAttribute(1, opinions, opinionsAmount);
    const thirdRatedAttribute = getRatesForAttribute(2, opinions, opinionsAmount);
    const fourthRatedAttribute = getRatesForAttribute(3, opinions, opinionsAmount);
    const fifthRatedAttribute = getRatesForAttribute(4, opinions, opinionsAmount);
    const sixthRatedAttribute = getRatesForAttribute(5, opinions, opinionsAmount);

    const ratedAttributes = [
        firstRatedAttribute,
        secondRatedAttributes,
        thirdRatedAttribute,
        fourthRatedAttribute,
        fifthRatedAttribute,
        sixthRatedAttribute,
    ];
    const overallRate = round(sum(map(ratedAttributes, (attribute) => attribute.rates.average)) / 6, 2);

    return {
        attributes: get(productDetails, 'attributes'),
        brand: get(productDetails, 'brand'),
        category: get(productDetails, 'category'),
        opinions: transformOpinions(opinions),
        photo: get(productDetails, 'photo'),
        productCode: toNumber(get(productDetails, 'productCode')),
        productId: toNumber(get(productDetails, 'productId')),
        productNameId: get(productDetails, 'productNameId'),
        rates: {
            opinionsAmount,
            overallRate,
            ratedAttributes,
        },
        title: get(productDetails, 'title'),
    }
};

const transformOpinions = (opinions: Opinion[]) => map(opinions, (opinion) => {
    const notUsefulVotes = toNumber(opinion.notUsefulVotes);
    const usefulVotes = toNumber(opinion.usefulVotes);
    const usefulnessRate = (usefulVotes - notUsefulVotes);
    const totalUsefulnessVotes = notUsefulVotes + usefulVotes;

    const date = trimEnd(opinion.date, ',');
    const [day, month, year] = map(split(date, '-'), toNumber);

    const overallVerbalGrade = opinion.overallRate;
    const overallNumericalGrade = toNumericalGrade(overallVerbalGrade);

    return {
        content: opinion.content,
        date: {
            day,
            month,
            year,
        },
        grades: isEmpty(opinion.grades)
            ? map([0, 1, 2, 3, 4, 5], (index) => ({
                attribute: getNthAttributeName(index, opinions),
                grade: overallNumericalGrade,
            }))
            : map(opinion.grades, (rate) => ({
                attribute: trimEnd(rate.attribute, ','),
                grade: toNumericalGrade(rate.grade),
            })),
        notUsefulVotes,
        opinionId: opinion.opinionId,
        opinionTitle: opinion.opinionTitle,
        overallNumericalGrade,
        overallVerbalGrade,
        purchaseConfirmed: opinion.purchaseConfirmed,
        reviewerName: opinion.reviewerName,
        totalUsefulnessVotes,
        usefulVotes,
        usefulnessRate,
    }
});

const getRatesForAttribute = (nthAttribute: number, opinions: Opinion[], opinionsAmount: number) => {
    const collectionOfAttributes = getCollectionOfAttributes(opinions);
    const nthAttributeCollection = map(collectionOfAttributes, (attributes) => attributes[nthAttribute]);

    const attributesRates = map(nthAttributeCollection, (attribute) => attribute.grade);
    const nthAttributeNumericalRates = map(attributesRates, toNumericalGrade);
    const nthAttributeAverageRate = round(
        reduce(nthAttributeNumericalRates, (total, rate) => total + rate, 0) / opinionsAmount,
        2,
    );

    return {
        attributeName: trimEnd(getNthAttributeName(nthAttribute, opinions), ':'),
        rates: {
            average: nthAttributeAverageRate,
            rated1: filter(nthAttributeNumericalRates, (rate) => rate === 1).length,
            rated2: filter(nthAttributeNumericalRates, (rate) => rate === 2).length,
            rated3: filter(nthAttributeNumericalRates, (rate) => rate === 3).length,
            rated4: filter(nthAttributeNumericalRates, (rate) => rate === 4).length,
            rated5: filter(nthAttributeNumericalRates, (rate) => rate === 5).length,
        },
    }
};

const getCollectionOfAttributes = (opinions: Opinion[]) => map(opinions, (opinion) => {
    const grades = get(opinion, `grades`);

    return isEmpty(grades)
        ? map([0, 1, 2, 3, 4, 5], (attribute) => ({
            attribute: getNthAttributeName(attribute, opinions),
            grade: opinion.overallRate,
        }))
        : grades;
});

const getNthAttributeName = (nthAttribute: number, opinions: Opinion[]) => {
    const nthAttributesNames = compact(map(
        opinions,
        (opinion) => {
            const grades = get(opinion, 'grades');
            const headGrade = nth(grades, nthAttribute);
            const headGradeAttributeName = get(headGrade, 'attribute');
            return headGradeAttributeName;
        },
    ));

    return nthAttributesNames[0] ? nthAttributesNames[0] : 'undefined';
}

const toNumericalGrade = (grade: Rates) => {
    const gradeEnum = {
        // tslint:disable:object-literal-sort-keys
        'nieudany': 1,
        'wystarczający': 2,
        'w porządku': 3,
        'dobry': 4,
        'rewelacyjny': 5,
        // tslint:enable:object-literal-sort-keys
    };

    return gradeEnum[grade];
};