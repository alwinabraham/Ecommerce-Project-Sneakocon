var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
module.exports={

    addCart:(userId,productId)=>{
        let proObj={
            item:ObjectId(productId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.CART_COLLECTION).findOne({userid:ObjectId(userId)})
                if(user){
                    let proExist=user.productid.findIndex(product=> product.item==productId)
                    if(proExist!=-1){
                        db.get().collection(collection.CART_COLLECTION)
                        .updateOne({'productid.item':ObjectId(productId)},{
                            $inc:{'productid.$.quantity':1}
                        }).then(()=>{
                            resolve()
                        })
                    }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({userid:ObjectId(userId)},
                    {
                        $push:{productid:proObj}
                    }).then((responce)=>{
                        if(responce){
                            resolve(responce)
                        }else{
                            reject()
                        }
                    }).catch((err)=>{
                        console.log(err);
                    })
                }
            }else{
                let cartObj={
                    userid:ObjectId(userId),
                    productid:[proObj]
                }
                 db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((responce)=>{
                    if(responce){
                        resolve(responce)
                    }else{
                        reject()
                    }
                }).catch((err)=>{
                    console.log(err);
                })
                }
        })
    },getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{userid:ObjectId(userId)}
                },
                {
                    $unwind:'$productid'
                },
                {
                    $project:{
                        item:'$productid.item',
                        quantity:'$productid.quantity'
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
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                    }
                },
                {
                    $lookup: {
                        from:collection.CATEGORY_COLLECTION,
                        localField: 'products.brand',
                        foreignField: 'brand',
                        as: 'brands'
                    }
                },
                {
                    $unwind:"$brands"
                },
                {
                    $project:{
                        item:1,quantity:1,products:1,brands:1,discount:"$products.discount",categoryDiscount:"$brands.discount",
                        resultDiscount:{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}},
                        roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"},{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]},
                        DiscountedTotal: { $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] },
                        result:{$multiply:["$quantity",{ $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] }]} 
                    }
                }
            ]).toArray()
            console.log(cartItems);
                if(cartItems){
                    resolve(cartItems)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
              
    },addAddress:(userId,data)=>{

        let addressObj={
            firstname:data.firstname,
            lastname:data.lastname,
            address:data.address,
            phone:data.phone,
            email:data.email_address,
            post:data.postal_zip,
            stateCountry:data.state_country,
            paymentmethod:data.paymentmethod,
            userid:ObjectId(userId)
        }
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({address:data.address})
                if(!user){
                    await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then((responce)=>{
                    if(responce){
                        resolve(responce)
                    }else{
                        reject()
                    }
                }).catch((err)=>{
                    console.log(err);
                })
            }else{
                resolve()
            }
        })
    },checkExistingAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.ADDRESS_COLLECTION).find({userid:ObjectId(userId)}).toArray()
            if(user){
                resolve(user)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getAUserAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.ADDRESS_COLLECTION).find({userid:ObjectId(userId)}).toArray()
            if(user[0]==null){
                resolve()
            }else{
                resolve(user)
                if(user){
                    resolve(user)
                }else{
                    reject()
                }
            }
        })
    },getACart:(cartId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.CART_COLLECTION).find({_id:ObjectId(cartId)}).toArray()
            if(user){
                resolve(user)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
    },changeQuantity: (({ cart, product, count }) => {
        count = parseInt(count)
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cart), 'productid.item': ObjectId(product) }, {
                $inc: { 'productid.$.quantity': count }
            }).then(() => {
                if (count == 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }),deleteCart:(cartId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(cartId)},{$pull:{productid:{item:ObjectId(proId)}}}).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
            })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{userid:ObjectId(userId)}
                },
                {
                    $unwind:'$productid'
                },
                {
                    $project:{
                        item:'$productid.item',
                        quantity:'$productid.quantity'
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
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                    }
                },
                {
                    $lookup: {
                        from:collection.CATEGORY_COLLECTION,
                        localField: 'products.brand',
                        foreignField: 'brand',
                        as: 'brands'
                    }
                },
                {
                    $unwind:"$brands"
                },
                {
                    $project:{
                        item:1,quantity:1,products:1,brands:1,discount:"$products.discount",categoryDiscount:"$brands.discount",
                        resultDiscount:{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}},
                        roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"},{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]},
                        DiscountedTotal: { $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] },
                        result:{$multiply:["$quantity",{ $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] }]} 
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:["$quantity", { $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] }]}}
                    }
                }

            ]).toArray()
              if(total[0]?.total){
                resolve(total[0]?.total)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getACartAddress:(cartId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.ADDRESS_COLLECTION).find({_id:ObjectId(cartId)}).toArray()
            if(user[0]==null){
                resolve()
            }else{
                resolve(user)
            }
        })
    },getSeperateCartItems:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let products = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{userid:ObjectId(userId)}
                    },
                    {
                        $unwind:'$productid'
                    },
                    {
                        $project:{
                            item:'$productid.item',
                            quantity:'$productid.quantity'
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
                            item:1,quantity:1,products:{$arrayElemAt:['$products',0]},price:{$arrayElemAt:['$products.price',0]},result:{$multiply:["$quantity",{$toInt:{$arrayElemAt:['$products.price',0]}}]}
                        }
                    }
                ]).toArray()
                  if(products){
                    resolve(products)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })


    },getAcartId:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.CART_COLLECTION).findOne({userid:ObjectId(userId)})
            if(user?._id){
                resolve(user?._id)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })


    },deleteAAddress:(addressId)=>{
        return new Promise(async(resolve,reject)=>{
          db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:ObjectId(addressId)}).then((responce)=>{
            if(responce){
                resolve(responce)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
        })
    }
}

