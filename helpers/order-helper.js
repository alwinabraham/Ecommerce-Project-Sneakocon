var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { checkExistingAddress } = require('./cart-helper');
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_59QqPLVh3IfCVm',
    key_secret: '8m0oWpgWMHE82hP3hP7lq7wl',
  });

module.exports={

    addAOrder:(userId,address,paymentmethod,products,total)=>{
        let orderObj={
            userid:ObjectId(userId),
            address:address,
            products:products,
            deliveryDate:new Date(),
            paymentmethod:paymentmethod,
            deliveryStatus:"Checking",
        }
        return new Promise(async(resolve,reject)=>{
           db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((responce)=>{
                if(responce.insertedId){
                    resolve(responce.insertedId)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },getAOrderDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({userid:ObjectId(userId)}).toArray()
            if(order){
                resolve(order)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },cancelAorder:(orderId,userId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId)},
                                                                {$set:{"products.$[element].productStatus":"cancelled"}},
                                                                {multi:true , arrayFilters: [{"element.productid" : ObjectId(proId) }]}).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },getOrderProducts:(cartId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{cartid:cartId}
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
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]},result:{$multiply:["$quantity",{$toInt:{$arrayElemAt:['$products.price',0]}}]}
                    }
                }

            ]).toArray()
                if(cartItems){
                    resolve(cartItems)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    },getEveryOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.ORDER_COLLECTION).find({}).sort({"_id":-1}).toArray()
            if(products){
                resolve(products)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getProductsOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderProducts = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                        // item:1,quantity:1,products:1,brands:1,discount:"$products.discount",categoryDiscount:"$brands.discount",
                        // resultDiscount:{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}},
                        // roundedValue: { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"},{$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]},
                        // DiscountedTotal: { $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] },
                        // result:{$multiply:["$quantity",{ $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] }]}, 
                        productid:"$products._id",
                        productName:"$products.productName",
                        price: { $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] },
                        quantity:1,
                        sumTotal:{$multiply:["$quantity",{ $subtract: [ {$toInt:"$products.price"}, { $round: [ {$multiply:[{ $multiply: [ {$toInt:"$products.price"}, {$cond: { if: { $gt: [ "$products.discount", "$brands.discount" ] }, then: "$products.discount", else:"$brands.discount"}}]},.01]}, 0 ]} ] }]}, 
                        productStatus:"checking",
                        image:"$products.image"
                    }
                }

            ]).toArray()
                if(orderProducts){
                    resolve(orderProducts)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    
    },getSeperateProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{userid:ObjectId(userId)}
                },
                {
                    $sort:{"_id":-1}
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

    },deleteAfterOrder:(cartId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({_id:ObjectId(cartId)}).then(()=>{
                resolve()
            })
        })
    },generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total, 
                currency: "INR",
                receipt: ""+orderId
            };
            instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err)
            }else{
                resolve(order)
            }
            });
        })
    },getIndividualOrders:async(orderId)=>{
        try{
            let individualorder = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(orderId)}
                },
                {
                    $unwind:'$products'
                }
            ]).toArray()
                if(individualorder){
                    return individualorder
                }else{
                    throw "error"
                }
            }catch (error){
                throw error
            }
    
    },updateASingleProductStatus:(orderId,proId,status)=>{
        console.log(orderId,proId,status);
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId)},
                                                                            {$set:{"products.$[element].productStatus":status}},
                                                                         {multi:true , arrayFilters: [{"element.productid" : ObjectId(proId) }]}).then((responce)=>{

            resolve(responce)
            })
        })
    },getOrderedProductsQuantity:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
           let orderedQuantity = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:ObjectId(orderId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    productid:'$products.productid',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'productid',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $unwind:"$product"
            },
            {
                $project:{
                    _id:'$product._id',
                    productName:'$product.productName',
                    brand:'$product.brand',
                    price:'$product.price',
                    colour:'$product.colour',
                    gender:'$product.gender',
                    description:'$product.description',
                    image:'$product.image',
                    stock:{ $subtract: [ {$toInt:"$product.stock"}, {$toInt:"$quantity"} ] },
                    discount:'$product.discount',
                    search:'$product.search'
                }
            }
           ]).toArray()
                if(orderedQuantity){
                    resolve(orderedQuantity)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    }
}

