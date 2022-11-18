const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/logout', function(req, res, next) {
  delete req.session.userlogin;
  delete req.session.useractive;
  delete req.session.address;
  res.redirect('/')
});

router.get('/admin-logout',(req,res)=>{
  delete req.session.adminActive;
  res.redirect('/admin')
})
// router.get('/user-profile',(req,res)=>{
//   res.render('user/user-profile')
// })
module.exports = router;
