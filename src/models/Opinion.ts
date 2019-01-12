import { Document, Schema, model } from 'mongoose';

export interface OpinionType extends Document {
    productId: number;
    content: string;
    date: {
        day: number;
        month: number;
        year: number;
        utcDate: Date;
    };
    grades: Array<{
        attribute: string;
        grade: number;
    }>;
    notUsefulVotes: number;
    opinionId: string;
    opinionTitle: string;
    overallNumericalGrade: number;
    overallVerbalGrade: string;
    purchaseConfirmed: boolean;
    reviewerName: string;
    totalUsefulnessVotes: number;
    usefulVotes: number;
    usefulnessRate: number;
};

export const OpinionSchema = new Schema({
    productId: { type: Number, ref: 'products' },
    content: String,
    date: {
        day: Number,
        month: Number,
        year: Number,
    },
    grades: [{
        attribute: String,
        grade: Number,
    }],
    notUsefulVotes: Number,
    opinionId: String,
    opinionTitle: String,
    overallNumericalGrade: Number,
    overallVerbalGrade: String,
    purchaseConfirmed: Boolean,
    reviewerName: String,
    totalUsefulnessVotes: Number,
    usefulVotes: Number,
    usefulnessRate: Number,
});

export const Opinion = model<OpinionType>('opinions', OpinionSchema);