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

  exports.cartPost = [async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).send({ error: 'User ID and Product ID are required' });
        }

        const cartRef = db.collection("cart").doc(userId);
        const cartDoc = await cartRef.get();

        if (!cartDoc.exists) {
            // Create a new cart if it doesn't exist
            await cartRef.set({ userId: userId, products: [{ productId, quantity: 1 }] });
        } else {
            // Update the existing cart
            const cartData = cartDoc.data();
            const products = cartData.products || [];
            const productIndex = products.findIndex(product => product.productId === productId);

            if (productIndex >= 0) {
                // Product already in cart, increment quantity
                products[productIndex].quantity += 1;
            } else {
                // Add new product to cart
                products.push({ productId, quantity: 1 });
            }

            await cartRef.update({ products });
        }

        // Send updated cart data
        const updatedCart = (await cartRef.get()).data();
        res.send(updatedCart);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ error: 'Something went wrong' });
    }
}];