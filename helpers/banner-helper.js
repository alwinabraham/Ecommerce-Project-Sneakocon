var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
module.exports={

    addBanner:(product)=>{
        let bannerObj={
            image:product.image,
            description:product.description
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerObj).then(()=>{
                resolve()        
            })
        })
    },getBanners:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                resolve(products)
        })
    }
}