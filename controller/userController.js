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



var otp = Math.floor(Math.random() * (999999 - 100000)) + 100000;

function sendTextMessage(phone){
  client.messages
  .create({
     body: otp,
     from: '+18142584639',
     to: '+91'+phone
   })
  .then(message => console.log(message.sid))
  .catch((error)=>{
  })
}


const getNewHome = (req,res)=>{
  productHelper.upcomingProducts().then((upcome)=>{
    productHelper.getTrendingProdcuts().then((trend)=>{
    productHelper.getProductDiscount().then((product)=>{
      if(req.session.userlogin){
        cartHelper.getCartCount(req.session.useractive).then((count)=>{
          req.session.navCartCount = count;
        res.render('newHome',{product,trend,upcome,title:req.session.userlogin,count,logout:"LOGOUT",check:true});
        })
  
      }else{
        res.render('newHome',{product,trend,upcome,check:false});
      }  
  })
  })
})
}


const postUserLogin = async(req,res)=>{
  let {email,password} = req.body;
  userHelper.checkValidUser(email).then((responce)=>{
    if(responce){
      req.session.activeUser = true;
    }else{
      req.session.activeUser = false;
    }
  })
  userHelper.getAUserEmailAddress(email).then(async (user)=>{
    if(user[0] == null){
      res.redirect('/')
    }else{
      let auth= await bcrypt.compare(password, user[0].password)
      if(auth){
        let name = email.split("@");
        req.session.userlogin = name[0];
        req.session.useractive = user[0]._id
        res.redirect('back')
      }else if(user[0].status == "unblock"){
        res.redirect('/')
      }
      else{        
        res.redirect('/')
      }
    }
  })
}


const getUserSignup = (req,res)=>{
  res.render('user/user-signup',{check:true})
}


const postUserSIgnup = (req,res)=>{
  req.session.otpcheck = otp
  console.log(req.session.otpcheck);
  let {name,email,phone,password,reEnterPassword,status} = req.body
  req.session.signbody = {
    name,email,phone,password,status
  }
  req.session.phone = phone
  userHelper.checkEmailExist(email).then((count)=>{
    if(count > 0){
      res.redirect('/user-signup')
    }
    else{
      if(password == reEnterPassword){
        sendTextMessage(phone);
        res.redirect('/otpcheck')
      }else{
        res.redirect('/user-signup')
      }}
    })
  }


const getOtpcheck = (req,res)=>{
  setTimeout(myGreeting, 30000);
  function myGreeting(){
    req.session.otpcheck = null;
    }
    res.render('otp-check')
  }

const getResendOtp = (req,res)=>{
  req.session.otpcheck = otp
  console.log(req.session.otpcheck);
  sendTextMessage(req.session.phone);
  res.redirect('/otpcheck')
}


const postOtpCheck = (req,res)=>{

    let {userotp} = req.body
    let {name,email,password,status} = req.session.signbody
    if(userotp == req.session.otpcheck){
      userHelper.addAUser(req.session.signbody,(data)=>{
      })
      req.session.userlogin = name;
      res.redirect('/') 
    }else{
      res.redirect('/user-signup')
    }
  }


const getProductDetails = (req,res)=>{
    const value = req.params.id
    req.session.cartProduct=value
    productHelper.trendingSetter(value).then(()=>{
    })
    productHelper.getAProductDiscount(value).then((product)=>{
      productHelper.getFeatureProduct().then((feature)=>{
        res.render('product-details',{product,feature});
      }).catch(()=>{
        res.render('error')
      })
    }).catch(()=>{
      res.render('error')
    })
  }


const getCartLogin = (req,res)=>{
    res.render('cart-login')
  
  }


const postCartLogin = (req,res)=>{
    let {email,password} = req.body;
    userHelper.getAUserEmailAddress(email).then((user)=>{
      if(user[0] == null){
        res.redirect('/cart-add')
      }else{
        if(user[0].status == "unblock"){
          res.redirect('back')
        }else if(!bcrypt.compare(user[0].password,password)){
          res.redirect('/cart-add')
        }else{
          let name = email.split("@");
          req.session.userlogin = name[0];
          req.session.useractive = user[0]._id
          res.redirect('/cart-add')
        }
      }
    })
  }


const getCartAdd = (req,res)=>{
    if(req.session.useractive){
      if(req.session.cartProduct){
        let quantity = 1;
       cartHelper.addCart(req.session.useractive,req.session.cartProduct,quantity).then(()=>{
        })
      res.redirect('/cart-list')
      // res.json(true)
      }else{
        res.redirect('/cart-list')
        // res.json(true)
      } 
    }else{
      // res.render('cart-login')
      res.json(false)
    }
  }


const getCartList = async(req,res)=>{

  if(req.session.useractive){
    userHelper.checkValidUserId(req.session.useractive).then((responce)=>{
      if(responce){
        req.session.activeUser = true;
      }else{
        req.session.activeUser = false;
      }
    })
    cartHelper.getCartCount(req.session.useractive).then((count)=>{
      req.session.navCartCount = count;
      })
    let total= await cartHelper.getTotalAmount(req.session.useractive)
    req.session.total = total;
    cartHelper.getCartProducts(req.session.useractive).then((products)=>{
      if(total){
        res.render('cart-list',{products,total,count:req.session.navCartCount})
      }else{
        res.render('cart-empty-list')
      }
    })}else{
    res.redirect('/cart-login')
  }
}


const getCartListPage = (req,res)=>{

  if(req.session.useractive){
    if(req.session.cartProduct){
      let quantity = 1;
     cartHelper.addCart(req.session.useractive,req.session.cartProduct,quantity).then(()=>{
      })
    res.redirect('/cart-list')
    }else{
      res.redirect('/cart-list')
    } 
  }else{
    res.render('cart-login')
  }
}


const getwishListLogin = (req,res)=>{
    res.render('wishlist-login')
  }


const postWishList = (req,res)=>{
    let {email,password} = req.body;
    userHelper.getAUserEmailAddress(email).then((user)=>{
      if(user[0] == null){
        res.redirect('/wishlist-add')
      }else{
        if(user[0].status == "unblock"){
          res.redirect('/')
        }else if(!bcrypt.compare(user[0].password,password)){
          res.redirect('/wishlist-add')
        }else{
          let name = email.split("@");
          req.session.userlogin = name[0];
          req.session.useractive = user[0]._id
          res.redirect('/wishlist-add')
        }
      }
    })
  }


const getWishListAdd = (req,res)=>{
  if(req.session.useractive){
    if(req.session.cartProduct){
      wishlistHelper.addWish(req.session.useractive,req.session.cartProduct).then(()=>{
      })
      res.redirect('/wishlist-list')
      // res.json(true)
    }else{
      res.redirect('/wishlist-list')
      // res.json(true)
    } 
  }else{
    // res.render('wishlist-login')
    res.json(false)
  }
}


const getWishListList = (req,res)=>{
  //code something to get the documents in the collection
  wishlistHelper.wishListChecker(req.session.useractive).then((data)=>{
    if(data?.productid){
        if(req.session.useractive){
    wishlistHelper.getWishItems(req.session.useractive).then((products)=>{
      res.render('wishlist-list',{products})
    })
  }else{
    res.redirect('/wishlist-login')
  }
    }else{
      res.render('wishlist-empty')
    }
  })
}


const postWishToCart = (req,res)=>{
    let {wish,product}=req.body;
    console.log(wish,product);
    req.session.cartProduct = product;
    wishlistHelper.deleteWish(wish, product).then(()=>{
      wishlistHelper.getWishCount(req.session.useractive).then((count)=>{
        res.json(count)
      })
    })
  }


const getCheckout = async(req,res)=>{

    let total= await cartHelper.getTotalAmount(req.session.useractive)
      userId=req.session.useractive;
      discountedTotal = total
      if(req.session.discountTotal){
        newTotal = req.session.discountTotal;
        discountedTotal = newTotal
        req.session.total = newTotal
      }
      cartHelper.getAUserAddress(req.session.useractive).then((items)=>{
        address = req.session.address
        if(address){
          address = address[0]
        }
        cartHelper.getCartProducts(req.session.useractive).then((data)=>{
          res.render('checkout',{total,items,address,data,userId,discountedTotal})
        })
    })
  }


const postCheckout = (req,res)=>{

    cartHelper.getAcartId(req.session.useractive).then((cartId)=>{
      req.session.cartactive = cartId
    })
    cartHelper.addAddress(req.session.useractive,req.body).then(()=>{
    })
    orderHelper.getProductsOrder(req.session.useractive).then((data)=>{
      orderHelper.addAOrder(req.session.useractive,address,req.body.paymentmethod,data,req.session.total).then((orderId)=>{
        orderHelper.getOrderedProductsQuantity(orderId).then((data)=>{
          productHelper.updateAfterOrder(data).then(()=>{
            
          })
        })
        productHelper.stockUpdater(orderId).then(()=>{

        })
        if(req.body.paymentmethod == 'COD'){
              res.json({CODStatus:true})
        }else if(req.body.paymentmethod == 'RazorPay'){
          orderHelper.generateRazorpay(orderId,data[0]?.sumTotal).then((response)=>{
            response.razorStatus=true
            res.json(response)
        })
        }
        else if(req.body.paymentmethod == 'paypal'){
          res.json({paypalStatus:true})
        }
        })
    })
    }


const getOrderListAlter = (req,res)=>{
    orderHelper.getSeperateProducts(req.session.useractive).then((data)=>{
      res.render('user-order-list',{data})
    })
  }


const getUserOrderList = (req,res)=>{
    orderHelper.deleteAfterOrder(req.session.cartactive).then(()=>{
    })
    orderHelper.getEveryOrders().then((data)=>{
      res.render('user-order-list',{data})
    })
}


const postChangeQuantity = (req,res,next) => {
    cartHelper.changeQuantity(req.body).then((response) => {
      res.json(response)
    })
  }


const postDeleteCart = (req,res,next)=>{
    let {cart, product} = req.body
    cartHelper.deleteCart(cart, product).then(()=>{
      cartHelper.getCartCount(req.session.useractive).then((count)=>{
        req.session.navCartCount = count;
      res.json(count)
      })
    })
  }


const postWishDelete = (req,res,next)=>{
    let {wish, product} = req.body
    wishlistHelper.deleteWish(wish, product).then(()=>{
      res.json()
    })
}


const getUserProfile = (req,res)=>{
    if(req.session.useractive){
      res.redirect('/user-edit-details')
    }else{
      res.render('user/user-profile',{check:true})
    }
}


const getAddressAdd = (req,res)=>{
    cartHelper.getAUserAddress(req.session.useractive).then((data)=>{
      res.render('user/address-add',{data})
    })
}


const postAddressAdd = (req,res)=>{
    cartHelper.addAddress(req.session.useractive,req.body).then(()=>{
    })
    res.render('user/address-add')
}


const getUserEditDetails = (req,res)=>{
    userHelper.getAUser(req.session.useractive).then((data)=>{
      req.session.phone = data[0]?.phone
      data = data[0];
      res.render('user/user-edit-details',{data})
    })
}

const postUserEditDetails = (req,res)=>{
    var newValues = {$set : req.body}
    let id = req.session.useractive
    userHelper.updateAUser({_id:ObjectId(id)},newValues).then(()=>{
  
    })
    res.redirect('/user-edit-details')
}


const getGetAddress = (req,res)=>{
    cartHelper.getAAddress(req.session.useractive).then((data)=>{
    })
    res.render('/')
  }

const getChangePassword = (req,res)=>{
    req.session.passwordotp = otp;
    sendTextMessage(req.session.phone)
    res.render('user/password-change-otp-check')
  }

const postPasswordChangeOtp = (req,res)=>{
    let {otp} = req.body;
    if(otp == req.session.passwordotp){
      res.render('user/change-password')
    }else{
      res.render('user/user-edit-details',{message:"incorrect otp"})
    }
    }

const postChangePassword = async(req,res)=>{
    let user = req.session.useractive;
    let {password,reenterPassword} = req.body
    bcryptPassword = await bcrypt.hash(password,10)
    newPassword = {$set:{password:bcryptPassword}}
    if(password === reenterPassword){
        userHelper.updateAUser({_id:ObjectId(user)},newPassword).then(()=>{
        })
        res.redirect('/user-edit-details')
    }else{
        res.render('user/user-edit-details',{message:"Incorrect Password"})
    }
}


const getAddressDataUser = (req,res)=>{
    var id = req.params.user;
    cartHelper.getACartAddress(id).then((address)=>{
      req.session.address = address
      res.redirect('/checkout')
  })
  }


const getAllProduct = (req,res)=>{
    productHelper.getAllProduct().then((product)=>{
      categoryHelper.getAllCategory().then((brand)=>{
        if(req.session.userlogin){
          cartHelper.getCartCount(req.session.useractive).then((count)=>{
            req.session.navCartCount = count;
          res.render('home',{product,title:req.session.userlogin,brand,count,logout:"LOGOUT",check:true});
          })
        }else{
          res.render('home',{product,brand,check:false});
        } 
       })
    })
}


const getWomensWear = (req,res)=>{
    productHelper.getWomensWare().then((product)=>{
      categoryHelper.getAllCategory().then((brand)=>{
      if(req.session.userlogin){
        cartHelper.getCartCount(req.session.useractive).then((count)=>{
        res.render('home',{product,title:req.session.userlogin,brand,count,logout:"LOGOUT",check:true});
        })
      }else{
        res.render('home',{product,brand,check:false});
      } 
     })
    })
}


const getMensWear = (req,res)=>{
    productHelper.getmensWare().then((product)=>{
      categoryHelper.getAllCategory().then((brand)=>{
      if(req.session.userlogin){
        cartHelper.getCartCount(req.session.useractive).then((count)=>{
        res.render('home',{product,brand,title:req.session.userlogin,count,logout:"LOGOUT",check:true});
        })
      }else{
        res.render('home',{product,brand,check:false});
      } 
     })
    })
}


const getKidsWear = (req,res)=>{
    productHelper.getkidsWare().then((product)=>{
      categoryHelper.getAllCategory().then((brand)=>{
      if(req.session.userlogin){
        cartHelper.getCartCount(req.session.useractive).then((count)=>{
        res.render('home',{product,title:req.session.userlogin,brand,count,logout:"LOGOUT",check:true});
        })
      }else{
        res.render('home',{product,brand,check:false});
      } 
     })
    })
}


const getFilterBrand = (req,res)=>{
    let id = req.params.id
    productHelper.getProductByBrand(id).then((product)=>{
      categoryHelper.getAllCategory().then((brand)=>{
        if(req.session.userlogin){
          cartHelper.getCartCount(req.session.useractive).then((count)=>{
          res.render('home',{product,title:req.session.userlogin,brand,count,logout:"LOGOUT",check:true});
          })
        }else{
          res.render('home',{product,brand,check:false});
        } 
       })
    })
}


const getThankyou = (req,res)=>{
    res.render('THANKYOU')
}


const getUserProductsDetailsPage = (req,res)=>{
    let id = req.params.id
    orderHelper.getIndividualOrders(id).then((products)=>{
      res.render('user/user-products-details-page',{products})
  
    })
}


const postPay = (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/thankyou",
        "cancel_url": "http://localhost:3000/checkout"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.json({link:payment.links[i].href});
          break
        }
      }
  }
})
}


const postVerifyPayment = (req,res)=>{
  res.send('hi')
}

const getDeleteAddressId = (req,res)=>{
  let id = req.params.id
  cartHelper.deleteAAddress(id).then(()=>{
  })
  res.redirect('/address-add')
}


const getEditAddressId = (req,res)=>{
  let id = req.params.id
  cartHelper.getAUserAddress(req.session.useractive).then((data)=>{
    cartHelper.getACartAddress(id).then((Address)=>{
      oneAddress = Address[0];
    res.render('user/address-add',{oneAddress,data})
    })
  })
}


const postChangeSingleOrderStatus = (req,res)=>{
  let{order,product,status} = req.body
  orderHelper.updateASingleProductStatus(order,product,status).then(()=>{
    res.json()
  })
}
module.exports ={
    getNewHome,getCartAdd,getOrderListAlter,postPasswordChangeOtp,getDeleteAddressId,getCartListPage,
    postUserLogin,getCartList,getUserOrderList,postChangePassword,getEditAddressId,
    getUserSignup,getwishListLogin,postChangeQuantity,getAddressDataUser,
    postUserSIgnup,postWishList,postDeleteCart,getAllProduct,postChangeSingleOrderStatus,
    getOtpcheck,getWishListAdd,postWishDelete,getWomensWear,getResendOtp,
    postOtpCheck,getWishListList,getUserProfile,getMensWear,
    getProductDetails,postWishToCart,getAddressAdd,
    getCartLogin,getCheckout,postAddressAdd,getKidsWear,
    postCartLogin,postCheckout,getUserEditDetails,getFilterBrand,
    postUserEditDetails,getGetAddress,getChangePassword,getThankyou,
    getUserProductsDetailsPage,postPay,postVerifyPayment
  }
