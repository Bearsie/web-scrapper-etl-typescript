import { Schema, model, Document } from 'mongoose';

interface ProductDetailsType extends Document {
    attributes: Array<{
        name: string;
        value: string;
    }>,
    brand: string;
    category: string;
    photo: string;
    productCode: number;
    productId: number;
    productNameId: string;
    title: string;
};

const ProductSchema = new Schema({
    attributes: [{
        name: String,
        value: String,
    }],
    brand: String,
    category: String,
    photo: String,
    productCode: Number,
    productId: Number,
    productNameId: String,
    title: String,
});

export const Product = model<ProductDetailsType>('products', ProductSchema);


