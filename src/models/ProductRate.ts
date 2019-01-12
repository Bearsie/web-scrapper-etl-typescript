import { Document, Schema, model } from 'mongoose';

export interface RatesType extends Document {
    productId: number;
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

export const RateSchema = new Schema({
    productId: { type: Number, ref: 'products' },
    opinionsAmount: Number,
    overallRate: Number,
    ratedAttributes: [{
        attributeName: String,
        rates: {
            average: Number,
            rated1: Number,
            rated2: Number,
            rated3: Number,
            rated4: Number,
            rated5: Number,
        },
    }],
});

export const ProductRate = model<RatesType>('productrates', RateSchema);