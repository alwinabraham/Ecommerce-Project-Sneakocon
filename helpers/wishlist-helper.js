var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { use } = require('../routes');
module.exports={

    addWish:(userId,productId)=>{
        let proObj={
            item:ObjectId(productId),
        }
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({userid:ObjectId(userId)})
                if(user){
                    let proExist=user.productid.findIndex(product=> product.item==productId)
                    if(proExist!=-1){
                        resolve()
                    }else{
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({userid:ObjectId(userId)},
                    {
                        $push:{productid:proObj}
                    }).then(()=>{
                        resolve()
                    })
                }
            }else{
                let wishObj={
                    userid:ObjectId(userId),
                    productid:[proObj]
                }
                 db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then(()=>{
                    resolve()
            })
            }
        })
    },getWishItems:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{userid:ObjectId(userId)}
                },
                {
                    $unwind:'$productid'
                },
                {
                    $project:{
                        item:'$productid.item',
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,products:{$arrayElemAt:['$products',0]}
                    }
                }

            ]).toArray()
                if(wishItems){
                    resolve(wishItems)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    },deleteWish:(wishId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:ObjectId(wishId)},{$pull:{productid:{item:ObjectId(proId)}}}).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },wishListChecker:(userId)=>{
        return new Promise((resolve,reject)=>{
            let wishlist = db.get().collection(collection.WISHLIST_COLLECTION).findOne({userid:ObjectId(userId)})
            if(wishlist){
                resolve(wishlist)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },deleteAfterCarting:(wishId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).deleteOne({_id:ObjectId(wishId)}).then(()=>{
                resolve()
            })
        })
    },getWishCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{userid:ObjectId(userId)}
                },
                {
                    $project:{count:{$size:"$productid"}}
                }
            ]).toArray()
            if(count[0]?.count){
                resolve(count[0]?.count)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },
}