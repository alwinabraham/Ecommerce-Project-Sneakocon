var db=require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb')
var bcrypt = require('bcrypt')
module.exports={

    addAUser:(user)=>{
        return new Promise(async(resolve,reject)=>{
          let password = await bcrypt.hash(user.password,10)
          user.password = password
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{
                if(data){
                    resolve(data)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().sort({"_id":-1}).toArray()
            if(users){
                resolve(users)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },updateAUser:(value,edit)=>{
        try{
            db.get().collection(collection.USER_COLLECTION).updateOne(value,edit).then((responce)=>{
                if(responce){
                    return responce
                }else{
                    throw "error"
                }
            }).catch((err)=>{
                console.log(err);
            })
        }catch (error){
            throw error
        }
    },getAUser:async(Id)=>{
        try{
            let user=await db.get().collection(collection.USER_COLLECTION).find({_id:ObjectId(Id)}).toArray()
            if(user){
                return user
            }else{
                throw "error"
            }
        }catch(error){
            throw error;
        }
    },getAUserEmailAddress:(Id)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find({email:Id}).toArray()
            if(user){
                resolve(user)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },checkEmailExist:(Id)=>{
        return new Promise(async(resolve,reject)=>{
            let emailcount =await db.get().collection(collection.USER_COLLECTION).find({email:Id}).count()
            if(emailcount){
                resolve(emailcount)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    },checkValidUser:(Email)=>{
        return new Promise(async(resolve,reject)=>{
            let blockStatus = await db.get().collection(collection.USER_COLLECTION).findOne({email:Email})
            if(blockStatus.status == "block"){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    },checkValidUserId:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let blockStatus = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            if(blockStatus.status == "block"){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    }
}