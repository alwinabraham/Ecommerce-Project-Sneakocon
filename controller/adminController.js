const express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
const productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helper');
const categoryHelper = require('../helpers/category-helper');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const cartHelper = require('../helpers/cart-helper');
const orderHelper = require('../helpers/order-helper');
const dashboardHelper = require('../helpers/dashboard-helper');
const client = require('twilio')('AC2ca486c439b40cf76a99452cabbb18a6', 'c58594efac144e347b267b41c5839490');
const paypal = require('paypal-rest-sdk');
const multer  = require('multer');
const wishlistHelper = require('../helpers/wishlist-helper');
const couponHelper = require('../helpers/coupon-helper');
const bannerHelper = require('../helpers/banner-helper');

const getAdminDashboard = (req, res, next) =>{
    if(req.session.adminActive){
      res.redirect('/dashboard')
    }else{
      res.render('admin-login')
    }
}

const adminSignup =  (req, res, next) =>{
    let{username,password}=req.body;
    productHelper.checkLogin(username).then((product)=>{
      if(product[0] == null){
        res.redirect('/admin')
      }else{
      if(password==product[0].pass){
        req.session.adminActive = true
        res.redirect('/dashboard');
      }}
    })
  } 

const getReportForm = (req,res)=>{
  dashboardHelper.getdailytotalSales().then((datadaily)=>{
    let dateAmount = []
    let datechart = []
    for(let i in datadaily){
      dateAmount[i] = datadaily[i].totalAmount 
      datechart[i] = datadaily[i]._id.day
    }
    dashboardHelper.getmonthlytotalSales().then((datamonthly)=>{
      let monthAmount = []
      let monthchart = []
      for(let i in datamonthly){
        monthAmount[i] = datamonthly[i].totalAmount 
        monthchart[i] = datamonthly[i]._id.day
      }
    dashboardHelper.getyearlytotalSales().then((datayearly)=>{
      let yearAmount = []
      let yearchart = []
      for(let i in datayearly){
        yearAmount[i] = datayearly[i].totalAmount 
        yearchart[i] = datayearly[i]._id.day
      }
      dashboardHelper.getAllUsers().then((usertotal)=>{
      dashboardHelper.getGrandtotal().then((data)=>{
    if(data[0]){
          let {_id,totalAmount,totalquantity} = data[0]
    res.render('admin/reports',{totalAmount,totalquantity,usertotal,dateAmount,datechart,monthAmount,monthchart,yearAmount,yearchart,datadaily,datamonthly,datayearly})    
    }else{
      res.render('admin/reports',{usertotal})
    }
  })})})})})
}

const getDashboardPage = (req,res)=>{
    dashboardHelper.getdailytotalSales().then((datadaily)=>{
      let dateAmount = []
      let datechart = []
      for(let i in datadaily){
        dateAmount[i] = datadaily[i].totalAmount 
        datechart[i] = datadaily[i]._id.day
      }
      dashboardHelper.getmonthlytotalSales().then((datamonthly)=>{
        let monthAmount = []
        let monthchart = []
        for(let i in datamonthly){
          monthAmount[i] = datamonthly[i].totalAmount 
          monthchart[i] = datamonthly[i]._id.day
        }
      dashboardHelper.getyearlytotalSales().then((datayearly)=>{
        let yearAmount = []
        let yearchart = []
        for(let i in datayearly){
          yearAmount[i] = datayearly[i].totalAmount 
          yearchart[i] = datayearly[i]._id.day
        }
        dashboardHelper.getAllUsers().then((usertotal)=>{
        dashboardHelper.getGrandtotal().then((data)=>{
      if(data[0]){
            let {_id,totalAmount,totalquantity} = data[0]
      res.render('admin/dashboard',{totalAmount,totalquantity,usertotal,dateAmount,datechart,monthAmount,monthchart,yearAmount,yearchart,datadaily,datamonthly,datayearly})    
      }else{
        res.render('admin/dashboard',{usertotal})
      }
    })})})})})
  
  }
  
const getProductList = (req,res)=>{
  productHelper.getAllProductAdmin().then((product)=>{
    res.render('product-list',{product});
  })
}

const getAddProduct = (req,res)=>{
  categoryHelper.getAllCategory().then((brand)=>{
    res.render('add-product',{brand})
  })
}

const postAddProduct = (req, res) => {
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })
  req.body.image = fileName
  productHelper.addProduct(req.body).then(() => {
    res.redirect('/product-list')
  })
}


const postUpdateProduct = (req,res)=>{
  var newValues = {$set : req.body}
  let {id} = req.session.editor;
  const files = req.files
  const fileName = files.map((file) => {
  return file.filename
  })
    if(req.files==null){
      productHelper.updateAProduct({_id:ObjectId(id)},newValues).then(()=>{

      })
      res.redirect('/product-list')
    }else{
      req.body.image = fileName
      newValues = {$set : req.body}
      productHelper.updateAProduct({_id:ObjectId(id)},newValues).then(()=>{
        res.redirect('/product-list')
      })
    }
}

const postSearch = (req,res)=>{
  let {value} = req.body;
  productHelper.searchAProduct(value).then((product)=>{
    res.render('product-list',{product});
})
}

const getDeleteUser = (req,res)=>{
    const value = req.params.user;
    
    productHelper.BlockAProduct(value).then(()=>{
      res.redirect('/product-list')
    }).catch(()=>{
      res.render('error')
    })
    }

const getEditUser = (req,res)=>{
    var id = req.params.user;
    req.session.editor={
      id
    }
    productHelper.getAProduct(id).then((products)=>{
      categoryHelper.getAllCategory().then((items)=>{
        let product = products[0];
      res.render('edit-product',{product,items});
    }).catch(()=>{
      res.render('error')
    })
    }).catch(()=>{
      res.render('error')
    })
  }

const getUsersList = (req,res)=>{
  userHelper.getAllUsers().then((users)=>{
    res.render('users-list',{users});
  })}

const getBlockId = (req,res)=>{
  const Id = req.params.id;
    userHelper.getAUser(Id).then((user)=>{
      if(user[0].status == "block"){
        userHelper.updateAUser({_id:ObjectId(Id)},{$set:{status:"unblock"}}).then(()=>{
        res.redirect('/users-list')
      }).catch(()=>{
        res.render('error')
      })
    }else{
        userHelper.updateAUser({_id:ObjectId(Id)},{$set:{status:"block"}}).then(()=>{
        res.redirect('/users-list')
        }).catch(()=>{
          res.render('error')
        })
      }
    }).catch(()=>{
      res.render('error')
    })
  }

  const getCategoryList = (req,res)=>{
      categoryHelper.getAllCategory().then((category)=>{
        res.render('category-list',{category});
      })
    }


const getCategoryAdd = (req,res)=>{
    res.render('category-add')
  }


const postCategoryAdd = (req,res)=>{
    categoryHelper.addCategory(req.body,()=>{
    })
    res.redirect('/category-list')
  }


const getCategoryDeleteId = (req,res)=>{
    const value = req.params.id;
    categoryHelper.checkCategory(value).then((count)=>{
      if(count != 0){
        res.redirect('/category-list')
      }else{
          categoryHelper.deleteACategory(value).then(()=>{
          res.redirect('/category-list')
        }).catch(()=>{
          res.render('error')
        })
      }
    }).catch(()=>{
      res.render('error')
    })

  }


const getCategoryEditUser = (req,res)=>{
    var id = req.params.user;
    req.session.editor={
      id
    }
      categoryHelper.getACategory(id).then((category)=>{
      category = category[0];
      res.render('category-edit',{category});
        }).catch(()=>{
          res.render('error')
        })
  }


const postCategoryEdit = (req,res)=>{
    categoryObj={
      brand:req.body.brand,
      discount:parseInt(req.body.discount)
    }
    var newValues = {$set : categoryObj}
    let {id} = req.session.editor;
    categoryHelper.updateACategory({_id:ObjectId(id)},newValues,req.body.brand).then(()=>{

      res.redirect('/category-list')
      })
  }


const postCategoryCreate = (req,res)=>{
    let {name,...values}= req.body
    let categoryValues =Object.values(values);
    categoryHelper.createACatagory(name,categoryValues,()=>{
    })
    res.redirect('/category-list')
  }

  
const getOrdersList = (req,res)=>{
    orderHelper.getEveryOrders().then((data)=>{
      var date = new Date(data[0]?.deliveryDate).toLocaleDateString();
      
      res.render('admin/orders-admin-list',{data,date})
    })
  }


const postCancelSingleOrder = (req,res,next)=>{
    let {order,user,product} = req.body
    orderHelper.cancelAorder(order,user,product).then(()=>{
      res.json()
    })
}


const getCouponList = (req,res)=>{
    couponHelper.getAllCoupon().then((product)=>{
      res.render('admin/coupon-list',{product})
    })
}


const postAddCoupon = (req,res)=>{
  date = req.body.expiryData
  value = date.split("/");
  newDate=value[1]+"/"+value[0]+"/"+value[2];
    couponObj={
      couponName:req.body.couponName,
      deduction:req.body.deduction,
      expiryData:newDate
    }
    couponHelper.addCoupon(couponObj).then(()=>{
    })
    res.redirect('/coupon-list')
}


const postCheckCoupon = (req,res)=>{
  console.log(req.body);
    couponHelper.checkCoupon(req.session.useractive,req.body.couponId,parseInt(req.body.total)).then((newTotal)=>{
      if(typeof(newTotal)=="string"){
        message = newTotal
        res.json(message)
      }else{
        req.session.discountTotal = newTotal;
        res.json(newTotal)
      }

    })
}


const getOrderProductDetails = (req,res)=>{
    let id = req.params.id
    orderHelper.getIndividualOrders(id).then((products)=>{
        res.render('admin/order-product-details',{products})
    }).catch(()=>{
      res.render('error')
    })
}


const deleteDeleteCoupon = (req,res)=>{
   let {couponid} = req.body
   couponHelper.deleteACoupon(couponid).then((responce)=>{
    res.json(responce);
   })
}

const getBannerManagement = (req,res)=>{
  bannerHelper.getBanners().then((products)=>{
    res.render('admin/banner-management',{products})
    
  })
}

const postBannerManagement = (req,res)=>{
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })
  req.body.image = fileName
    bannerHelper.addBanner(req.body).then(() => {
    res.redirect('/banner-management')
  })
}

module.exports ={
    getAdminDashboard,postCategoryAdd,getBannerManagement,
    adminSignup,getCategoryDeleteId,
    getDashboardPage,getCategoryEditUser,
    getProductList,postCategoryEdit,
    getAddProduct,postCategoryCreate,
    postAddProduct,getOrdersList,
    postSearch,postCancelSingleOrder,
    getDeleteUser,getCouponList,
    getEditUser,postAddCoupon,
    postUpdateProduct,postCheckCoupon,
    getUsersList,getOrderProductDetails,
    getBlockId,getReportForm,
    getCategoryList,deleteDeleteCoupon,
    getCategoryAdd,postBannerManagement
  }