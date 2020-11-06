const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helper')
const verifylogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')

  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  let wishlist=null
  if(user){
    cartCount=await userHelper.cartCount(user._id)
    wishlist=await userHelper.getWishPord(user._id)
    wishlist=wishlist.products
    
  }
  productHelper.getAllProducts().then((products)=>{
    

   
    res.render('user/view-products', {products,user,cartCount,wishlist});
  })
  
  
});
router.get('/Login',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.userLoginErr})
  req.session.userLoginErr=false

  
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/Signup',(req,res)=>{
   userHelper.doSignup(req.body).then((response)=>{
    req.session.userLoggedIn=true
    req.session.user=response
    res.redirect('/')
   })
})
router.post('/Login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.userLoggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.userLoginErr="invalid user name or password"
      res.redirect('/login')
    }
  })

})
router.get('/Logout',(req,res)=>{
  req.session.user=null;
  req.session.userLoggedIn=false;
  res.redirect('/login')
})
router.get('/cart',verifylogin,async(req,res)=>{
  
  let products=await userHelper.getCartProducts(req.session.user._id)
  let total= await userHelper.getTotalAmount(req.session.user._id)
  
  res.render('user/cart',{products,total,user:req.session.user})
})
router.get('/add-to-cart',verifylogin,(req,res)=>{
   userHelper.addToCart(req.query.id,req.session.user._id).then(()=>{
     res.json({status:true})
   })
})
router.post('/cart-change-quandity',verifylogin,(req,res)=>{
  userHelper.changeCartQuandity(req.body).then(async(responce)=>{
    let total=await userHelper.getTotalAmount(req.session.user._id)
    
    responce.total=total
    res.json(responce)
  })
})
router.post('/delete-product',(req,res)=>{
  
  userHelper.deteProduct(req.body).then(()=>{
    res.json({status:true})
  })
})
router.get('/place-order',verifylogin,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/placeorder',{total,user:req.session.user})

})
router.post('/place-order',verifylogin, async(req,res)=>{
  let products = await userHelper.orderProducts(req.session.user._id)
 
 
  let totalPrice=await userHelper.getTotalAmount(req.session.user._id)
  
 
 userHelper.orderPlace(req.body,products,totalPrice).then((orderId)=>{
  if(req.body['Payment-method']==='COD'){
    res.json({codSuccess:true})
  }else{
    userHelper.generateRazorPay(orderId,totalPrice).then((order)=>{
      res.json(order)

    }).catch((err) => {
      console.log("#### err");
      res.status(500).json({paymentErr:true});
   })
  }
   
 })
  
})
router.get('/orderPlaced',(req,res)=>{
  res.render('user/orderSuccess')
})
router.get('/orders',async(req,res)=>{
  let orders= await userHelper.getOrders(req.session.user._id)
 
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/orderProducts',async(req,res)=>{
  let product=await userHelper.orderedProducts(req.query.id)
  res.render('user/orderProducts',{user:req.session.user,product})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    console.log('paymentSuccess');
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{

        res.json({status:true})
      })

  }).catch(()=>{
    console.log("payment err");
    res.json({status:false,errmsg:'payment-failed'})
  })
})


router.post('/wish-list',(req,res)=>{
  
  userHelper.wishList(req.body).then((response)=>{
    
    res.json(response)

  })
})

router.get('/wish-list',async(req,res)=>{
  let products= await userHelper.getWishlist(req.session.user._id)
  res.render('user/wishlist',{products,user:req.session.user})
})
router.get('/remove-wish',(req,res)=>{
  userHelper.removeWish(req.session.user._id,req.query.id).then((response)=>{
    res.json({status:true})
  })
})
router.get('/search',async (req, res) => {
 
 

  userHelper.search(req.query.val).then((data) => {
   
    res.json(data)
    
  })
})
module.exports = router;
