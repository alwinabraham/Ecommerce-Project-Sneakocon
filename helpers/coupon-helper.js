var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
module.exports={

    addCoupon:(item)=>{
        console.log(item)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(item).then(()=>{
                resolve()        
            })
        })
    },getAllCoupon:()=>{
        return new Promise((resolve,reject)=>{
            let coupon= db.get().collection(collection.COUPON_COLLECTION).find().sort({"_id":-1}).toArray()
            if(coupon){
              resolve(coupon)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },checkCoupon:(userId,couponName,total)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:couponName}).then((coupon)=>{
            if(coupon?.couponName){
                if(coupon.expiryData >= new Date().toLocaleDateString()){
                    db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId),coupons:couponName}).then((user)=>{
                        if(user){
                            resolve("Already Used........................................") 
                        }else{
                            
                            db.get().collection(collection.USER_COLLECTION)
                            .updateOne({_id:ObjectId(userId)},
                            {
                                $push:{coupons:couponName}
                            }).then(()=>{
                                let discountResult = 0;
                                let deduction = coupon?.deduction
                                if(total>coupon?.limit){
                                    discountResult = (deduction*10)
                                }else{
                                    discountResult = total*(deduction/100)
                                }
                                let newResult = total - discountResult
                                let newtotal = Math.round(newResult)
                                if(newtotal){
                                    resolve(newtotal)
                                    console.log(newtotal);
                                  }else{
                                      reject()
                                  }
                              }).catch((err)=>{
                                  console.log(err);
                              })
                              }
                        })
                    }else{resolve("Already Expired........................................");}
                }else{resolve("Coupon Doesnt Exist.......................................");}
            })

        })
    },deleteACoupon:(couponId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(couponId)}).then((responce)=>{
                resolve(responce)
            })
        })
    }
}