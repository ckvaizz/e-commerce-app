var db=require('../config/connection')
var collections=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let admin=await db.get().collection(collections.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
                
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log("logged in");
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("password err")
                        resolve({status:false})

                    }
                })
            }else
            {
                console.log("user not found")
                resolve({status:false})
            }
        })

    },
    doSignUp:(adminData)=>{
        return new Promise(async (resolve,reject)=>{
            adminData.Password=await bcrypt.hash(adminData.Password,10)
            db.get().collection(collections.ADMIN_COLLECTION).insertOne(adminData)
            resolve(adminData)
        })

    },
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
         let users= await db.get().collection(collections.USER_COLLECTION).find().toArray()
         
         resolve(users)
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
            
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
           
            let products=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quandity:'$products.quandity'
                    
                    }
                },
                {
                        $lookup:{
                            from:collections.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                },
                {
                    $project:{
                        item:1,quandity:1,product:{$arrayElemAt:['$products',0]}
                    }
                }
                
            ]).toArray()
           
            resolve(products)

        })
    },
   
    userDetails:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
         let user=await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)})
                
                resolve(user)
            
        })
    },
    setStatus:(details)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(details.orderId)},
            {
                $set:{status:details.status}
            }
            )
        })
    }
    
    
}