var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
module.exports={

    addProduct:(product)=>{
        let productObj={
            productName:product.productName,
            description:product.description,
            gender:product.gender,
            colour:product.colour,
            brand:product.brand,
            price:product.price,
            stock:parseInt(product.stock),
            image:product.image,
            discount:parseInt(product.discount),
            search:parseInt(product.search),
            status:product.status
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productObj).then(()=>{
                resolve()        
            })
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find( { status: { $ne: "blocked" } } ).sort({"_id":-1}).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },
    getAllProductAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"_id":-1}).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getProductDiscount:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match:{status:"Available"}
                },
                {
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'brand',
                        foreignField:'brand',
                        as:'products'
                    }
                },
                {
                        $project:{
                        productName:1,brand:1,price:1,colour:1,gender:1,description:1,image:1,stock:1,
                        // discount:1,
                        // categoryDiscount:{$arrayElemAt:['$products.discount',0]},
                        // resultDiscount:{$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}},
                        roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]},
                        DiscountedTotal: { $subtract: [ {$toInt:"$price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]} ] } 
                    }
                },
                {
                    $sort:{_id:-1}
                }
            ]).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },
    searchAProduct:(value)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{productName:{$regex:value,$options:'i'}},{brand:{$regex:value,$options:'i'}},{price:{$regex:value,$options:'i'}},{colour:{$regex:value,$options:'i'}},{gender:{$regex:value,$options:'i'}}]}).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },deleteAProduct:(Id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(Id)}).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },BlockAProduct:(Id)=>{
        try{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(Id)},{$set:{status:"blocked"}}).then((responce)=>{
                if(responce){
                    return responce
                }else{
                    throw 'error'
                }
            }).catch((err)=>{
                console.log(err);
            })
        }catch (error){
            throw error
        }
    },updateAProduct:(reference,editedProduct)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne(reference,editedProduct).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },getAProduct:async(Id)=>{
        try{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:ObjectId(Id)}).toArray()
            if(product){
                return product
            }else{
                throw 'error'
            }
        }catch(error){
            throw error;
        }
    },checkLogin:(username)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.ADMIN_COLLECTION).find({user:username}).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getFeatureProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find( { status: { $ne: "blocked" } } ).limit(5).sort({"_id":-1}).toArray()
            if(product){
                resolve(product)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getWomensWare:()=>{
        return new Promise(async(resolve,reject)=>{
            let womensware = await db.get().collection(collection.PRODUCT_COLLECTION).find({gender:"FEMALE", status: { $ne: "blocked" } }).sort({"_id":-1}).toArray()
            if(womensware){
                resolve(womensware)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })            
    },getmensWare:()=>{
        return new Promise(async(resolve,reject)=>{
            let womensware = await db.get().collection(collection.PRODUCT_COLLECTION).find({gender:"MALE", status: { $ne: "blocked" } }).sort({"_id":-1}).toArray()
            if(womensware){
                resolve(womensware)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getkidsWare:()=>{
        return new Promise(async(resolve,reject)=>{
            let womensware = await db.get().collection(collection.PRODUCT_COLLECTION).find({gender:"", status: { $ne: "blocked" } }).sort({"_id":-1}).toArray()
            if(womensware){
                resolve(womensware)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getProductByBrand:async(Id)=>{
        try{
            let result = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(Id)})
                Brand = result.brand;
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:Brand , status: { $ne: "blocked" } }).sort({"_id":-1}).toArray()
                if(product){
                    return product
                }else{
                    throw "error"
                }
            }catch(error){
                throw(error);
            }
    },getAProductDiscount:async (proId)=>{
          try {
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(proId)}
                },
                {
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'brand',
                        foreignField:'brand',
                        as:'products'
                    }
                },
                {
                        $project:{
                        productName:1,brand:1,price:1,colour:1,gender:1,description:1,image:1,stock:1,
                        // discount:1,
                        // categoryDiscount:{$arrayElemAt:['$products.discount',0]},
                        // resultDiscount:{$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}},
                        roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]},
                        DiscountedTotal: { $subtract: [ {$toInt:"$price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]} ] } 
                    }
                }
            ]).toArray()
                if(product){
                    return product
                }else{
                    throw "nothingg"
                }
          } catch (error) {
            throw error
        }

    },getTrendingProdcuts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match:{status:"Available"}
                },
                {
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'brand',
                        foreignField:'brand',
                        as:'products'
                    }
                },
                {
                        $project:{
                        productName:1,brand:1,price:1,colour:1,gender:1,description:1,image:1,stock:1,search:1,
                        // discount:1,
                        // categoryDiscount:{$arrayElemAt:['$products.discount',0]},
                        // resultDiscount:{$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}},
                        roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]},
                        DiscountedTotal: { $subtract: [ {$toInt:"$price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$price"}, {$cond: { if: { $gt: [ "$discount", {$arrayElemAt:['$products.discount',0]} ] }, then: '$discount', else:{$arrayElemAt:['$products.discount',0]}}}]},.01]}, 0 ]} ] } 
                    }
                },
                {
                    $sort:{search:-1}
                },
                {
                    $limit:5
                }
            ]).toArray()
                if(product){
                    resolve(product)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })  
    },trendingSetter:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{$inc:{ search:1 }}).then(()=>{
                resolve()
            })
        }).catch((err)=>{
            console.log("=========errr=========")
        })
    },upcomingProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let noStockProducts = db.get().collection(collection.PRODUCT_COLLECTION).find({stock:0}).toArray()
                if(noStockProducts){
                    resolve(noStockProducts)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    }
    ,stockUpdater:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
            let newProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'products.productid',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        userid:1,address:1,products:1,deliveryDate:1,paymentmethod:1,deliveryStatus:1
                    }
                }
            ]).toArray()
                if(newProduct){
                    resolve(newProduct)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    },updateAfterOrder:(data)=>{
        return new Promise(async(resolve,reject)=>{
            for (let i in data){
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:data[i]._id},{$set:data[i]}).then((responce)=>{
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
    },addRateing:()=>{
        return new Promise((resolve,reject)=>{

        })
    }
}
