const { db } = require("../util/admin");

exports.cartById = async (req, res) => {
    try {
      const { userId } = req.params;
      const cartRef = db.collection('cart').doc(userId);
      const cartDoc = await cartRef.get();
  
      if (!cartDoc.exists) {
        return res.status(404).send({ error: 'Cart not found' });
      }
  
      res.send(cartDoc.data());
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).send({ error: 'Something went wrong' });
    }
  };

exports.cartPost = [
   async (req) => {
      const { productId, userId } = req.body;
      const cartSnap = db.collection("cart").doc(userId)
      const cartDoc = await cartSnap.get()
      if(!cartDoc.exists){
        await cartSnap.set({userId:userId,products:[{productId,quantity:1}]})
      }else{
        const cartData = cartDoc.data();
        const products = cartData.products || []
        const productIndex = products.findIndex(product=>product.productId===productId)
        if(productIndex>=0){
            products[productIndex].quantity+=1;
        }else{
            products.push({productId,quantity:1})
        }
        await cartSnap.update({products})
      }
      res.send(cartDoc.data());
   },
];