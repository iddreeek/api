const { db } = require("../util/admin");

exports.cartById = async (req, res) => {
   try {
      const { userId } = req.params;
      const cartRef = db.collection("cart").doc(userId);
      const cartDoc = await cartRef.get();
      if (!cartDoc.exists) {
         return res.status(404).send({ error: "Cart not found" });
      }
      const products = cartDoc.data().products;
      const prodId = [];
      products.map((doc) => {
         prodId.push(doc.productId);
      });
      const prodCartPromise = prodId.map((productId) =>
         db.collection("products").doc(productId).get()
      );
      const productsSnapshots = await Promise.all(prodCartPromise);

      const productQuantityMap = {};
      products.forEach((doc) => {
         productQuantityMap[doc.productId] = doc.quantity;
      });

      const prodCart = productsSnapshots.map((snapshot) => ({
         id: snapshot.id,
         title: snapshot.data().title,
         price: Number(snapshot.data().price),
         image: snapshot.data().imageUrl,
         quantity: productQuantityMap[snapshot.id],
         totalPrice: Number(snapshot.data().price) * productQuantityMap[snapshot.id],
      }));

      res.status(200).json(prodCart);
   } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).send({ error: "Something went wrong" });
   }
};

exports.cartPost = async (req, res) => {
   try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
         return res.status(400).send({ error: "User ID and Product ID are required" });
      }

      const cartRef = db.collection("cart").doc(userId);
      const cartDoc = await cartRef.get();

      if (!cartDoc.exists) {
         // Create a new cart if it doesn't exist
         await cartRef.set({
            userId: userId,
            products: [{ productId: String(productId), quantity: 1 }],
         });
      } else {
         // Update the existing cart
         const cartData = cartDoc.data();
         const products = cartData.products || [];
         const productIndex = products.findIndex(
            (product) => product.productId === String(productId)
         );

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
      res.status(200).json(updatedCart);
   } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).send({ error: "Something went wrong" });
   }
};
