var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
module.exports={

    getGrandtotal:()=>{
        return new Promise(async(resolve,reject)=>{
        let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $group:{
                        _id:"",
                        totalAmount: { $sum: "$products.sumTotal" },
                        totalquantity: {$sum: "$products.quantity"}
                      }
                }
            ]).toArray()
                if(total){
                    resolve(total)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    },getAllUsers:()=>{
        return new Promise((resolve,reject)=>{
            let users =  db.get().collection(collection.USER_COLLECTION).countDocuments({})
            if(users){
                resolve(users)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },getdailytotalSales:()=>{
        return new Promise(async(resolve,reject)=>{
            let monthlytotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $group:{
                        _id: { day: { $dayOfMonth: "$deliveryDate"}},
                        month:{"$first":{ $month: "$deliveryDate"}},
                        year:{"$first":{ $year: "$deliveryDate"}},
                        totalAmount: { $sum: "$products.sumTotal" }
                        }
                },
                {
                    $sort:{"_id":-1}
                },
                {
                    $limit:30
                }
            ]).toArray()
                if(monthlytotal){
                    resolve(monthlytotal)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
    },getmonthlytotalSales:()=>{
        return new Promise(async(resolve,reject)=>{
            let monthlytotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $group:{
                        _id: { day: { $month: "$deliveryDate"}},
                        year : { "$first": { $year: "$deliveryDate"}},
                        totalAmount: { $sum: "$products.sumTotal" }
                        }
                },
                {
                    $sort:{"_id":-1}
                },
                {
                    $limit:12
                }
                
            ]).toArray()
                if(monthlytotal){
                    resolve(monthlytotal)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })

    },getyearlytotalSales:()=>{
        return new Promise(async(resolve,reject)=>{
            let monthlytotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $group:{
                        _id: { day: { $year: "$deliveryDate"}},
                        totalAmount: { $sum: "$products.sumTotal" }
                        }
                },
                {
                    $sort:{"_id":-1}
                },
                {
                    $limit:10
                }
            ]).toArray()
                if(monthlytotal){
                    resolve(monthlytotal)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })

    }
}