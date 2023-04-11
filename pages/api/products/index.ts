import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/database'
import { SHOP_CONSTANTS } from '@/database'
import { IProduct } from '@/interfaces'
import { Product } from '@/models'

type Data = 
| { message?: string } 
| IProduct[] ;

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getProducts(req, res)
        default:
            return res.status(400).json({ message: 'Bad request' })
    }
}

const getProducts = async ( req: NextApiRequest, res: NextApiResponse<Data> ) => {

    await db.connect()
    
    const { gender = 'all' } = req.query;
    
    let condition = {};
    
    if(gender !== 'all' && SHOP_CONSTANTS.validGenders.includes(`${ gender }`)) {
        condition = { gender };
    }
    
    const products = await Product.find(condition)
        .select('title price images inStock slug -_id')    
        .lean();
    await db.disconnect();

    
    const updatedProducts = products.map( (product) => {
        product.images = product.images.map( (image: string) => {
            return image.includes('https') ? image : `${process.env.HOST_NAME}/products/${image}`;
        })
        return product;
    })

    res.status(200).json(updatedProducts);
}