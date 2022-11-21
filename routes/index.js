const express = require('express');
var router = express.Router();
const paypal = require('paypal-rest-sdk');
const multer  = require('multer');

const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const confidential = require('../config/confidential')


paypal.configure({
  'mode': 'sandbox',
  'client_id': confidential.PAYPALID,
  'client_secret': confidential.PAYPALCLIENTSECRET
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = './public/uploads/'
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

const authorize = (req,res,next)=>{
  if(req.session.adminActive){
    next();
  }else{
    res.redirect('/admin')
  }
}
const activeUser = (req,res,next)=>{
  if(req.session.activeUser){
    next();
  }else{
    res.redirect('/')
  }
}
const cartauthorize = (req,res,next)=>{
  if(req.session.useractive){
    next();
  }else{
    res.redirect('/cart-login')
  }
}
const loginauthorize = (req,res,next)=>{
  if(req.session.useractive){
    next();
  }else{
    res.redirect('/user-profile')
  }
}
/* GET home page. */
router.get('/admin', adminController.getAdminDashboard)

router.post('/admin-signup', adminController.adminSignup)

router.get('/dashboard',authorize, adminController.getDashboardPage)

router.get('/reportform',authorize, adminController.getReportForm)

router.get('/product-list',authorize,adminController.getProductList)

router.get('/',userController.getNewHome)

router.get('/add-product',authorize,adminController.getAddProduct)

router.post('/add-product', upload.array('image'), adminController.postAddProduct)

router.post('/search',authorize,adminController.postSearch)

router.get('/delete/:user',adminController.getDeleteUser)

router.get('/edit/:user',adminController.getEditUser);

router.post('/update-product',upload.array('image'),adminController.postUpdateProduct)

router.post('/user-login',userController.postUserLogin)

router.get('/user-signup',userController.getUserSignup)

router.post('/user-signup',userController.postUserSIgnup)

router.get('/otpcheck',userController.getOtpcheck)

router.post('/otpcheck', userController.postOtpCheck)

router.get('/resend-otp',userController.getResendOtp)

router.get('/users-list',adminController.getUsersList)

router.get('/block/:id',adminController.getBlockId)

router.get('/category-list',authorize,adminController.getCategoryList)

router.get('/category-add',authorize,adminController.getCategoryAdd)

router.post('/category-add',adminController.postCategoryAdd)

router.get('/delete-category/:id',adminController.getCategoryDeleteId)

router.get('/product-details/:id',userController.getProductDetails)

router.get('/category-edit/:user',authorize,adminController.getCategoryEditUser);

router.post('/category-edit',adminController.postCategoryEdit)

router.post('/catagory-create',adminController.postCategoryCreate)

router.get('/cart-login',userController.getCartLogin)

router.post('/cart-login',userController.postCartLogin)

router.get('/cart-add',userController.getCartAdd)

router.get('/cart-list',userController.getCartList)

router.get('/cart-list-page',userController.getCartListPage)

router.get('/wishlist-login',userController.getwishListLogin)

router.post('/wishlist-login',userController.postWishList)

router.get('/wishlist-add',userController.getWishListAdd)

router.get('/wishlist-list',userController.getWishListList)

router.post('/wishToCart',userController.postWishToCart)

router.get('/checkout',cartauthorize,activeUser,userController.getCheckout)

router.post('/checkout',cartauthorize,userController.postCheckout)

router.get('/user-order-list-alter',cartauthorize,userController.getOrderListAlter)

router.get('/user-order-list',userController.getUserOrderList)

router.put('/change-quantity', userController.postChangeQuantity)

router.delete('/delete-cart',userController.postDeleteCart)

router.delete('/delete-wish',userController.postWishDelete)

router.get('/user-profile',userController.getUserProfile)

router.get('/address-add',loginauthorize,userController.getAddressAdd)

router.post('/address-add',loginauthorize,userController.postAddressAdd)

router.get('/user-edit-details',loginauthorize,userController.getUserEditDetails)

router.post('/user-edit-details',loginauthorize,userController.postUserEditDetails)

router.get('/get-address',userController.getGetAddress)

router.get('/change-password',loginauthorize,userController.getChangePassword)

router.post('/password-change-otp',userController.postPasswordChangeOtp)

router.post('/change-password',userController.postChangePassword)

router.get('/address-data/:user',userController.getAddressDataUser)

router.get('/orders-list',authorize,adminController.getOrdersList)

router.put('/cancel-single-order',adminController.postCancelSingleOrder)

router.post('/verify-payment',userController.postVerifyPayment)

router.post('/pay',userController.postPay)

router.get('/all-product',userController.getAllProduct)

router.get('/womenswear',userController.getWomensWear)

router.get('/menwear',userController.getMensWear)

router.get('/kidswear',userController.getKidsWear)

router.get('/filterbrand/:id',userController.getFilterBrand)

router.get('/coupon-list',adminController.getCouponList)

router.post('/add-coupon',adminController.postAddCoupon)

router.post('/check-coupon',adminController.postCheckCoupon)

router.get('/thankyou',userController.getThankyou)

router.get('/order-product-details/:id',adminController.getOrderProductDetails)

router.post('/change-single-order-status',userController.postChangeSingleOrderStatus)

router.get('/user-products-details-page/:id',userController.getUserProductsDetailsPage)

router.get('/delete-address/:id',userController.getDeleteAddressId)

router.get('/edit-address/:id',userController.getEditAddressId)

router.delete('/delete-coupon',adminController.deleteDeleteCoupon)


module.exports = router;

