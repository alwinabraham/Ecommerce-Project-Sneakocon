var db=require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { use } = require('../routes');
module.exports={

    addCategory:(product,callback)=>{
        categoryObj={
            brand:product.brand,
            discount:parseInt(product.discount)
        }
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryObj).then((data)=>{
            callback(data.insertedId)
        })
    },getAllCategory:()=>{
        return new Promise((resolve,reject)=>{
            let category= db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            if(category){
                resolve(category)
            }else{
                reject()
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
    ,deleteACategory:(Id)=>{
        try{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(Id)}).then((responce)=>{
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
    },updateACategory:(reference,editedCategory,newBrand)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne(reference)
                db.get().collection(collection.PRODUCT_COLLECTION).updateMany({brand:category.brand},{$set:{brand:newBrand}}).then((res)=>{
                    console.log(res);
                })
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne(reference,editedCategory).then((responce)=>{
                if(responce){
                    resolve(responce)
                }else{
                    reject()
                }
            }).catch((err)=>{
                console.log(err);
            })
        })
    },getACategory:async(Id)=>{
        try{
            let product=await db.get().collection(collection.CATEGORY_COLLECTION).find({_id:ObjectId(Id)}).toArray()
            if(product){
                return product
            }else{
                throw "error"
            }
        }catch (error){
            throw(error);
        }
    }
    ,createACatagory:(name,product,callback)=>{

        const results = [];

        product.forEach(element => {
            if (element !== '') {
              results.push(element);
            }
          });         
          var count = results.lenght;
        for(let i=0;i<count;i++){
            db.get().collection(name).insertOne({colour:results[i]}).then((responce)=>{
            callback(responce)
        })}
    },checkCategory:async(Id)=>{
        try{
            let count = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(Id)})
                let productNo = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:count.brand}).count()
            return productNo
        }catch (error){
            throw error
        }
    }
}