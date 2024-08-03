const { db, bucket } = require("../util/admin");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.products = async (req, res) => {
   try {
      const productsRef = db.collection("products");
      const snapshot = await productsRef.get();
      if (snapshot.empty) {
         res.status(404).send("No matching documents.");
         return;
      }
      const products = [];
      snapshot.forEach((doc) => {
         const data = doc.data();
         products.push({
            id: doc.id,
            title: data.title,
            price: data.price,
            description: data.description,
            category: data.category,
            imageUrl: data.imageUrl,
         });
      });
      res.status(200).send(products);
   } catch (error) {
      res.status(500).send("Error getting documents: " + error.message);
   }
};

exports.productsPost = [
   upload.single("image"),
   async (req, res) => {
      try {
         const { title, price, description, category, userId } = req.body; // Ensure userId is included in the request body
         const image = req.file;
         if (!image) {
            return res.status(400).json({ error: "Image file is required" });
         }
         const id = uuidv4();
         const imageName = `${id}_${image.originalname}`;
         const filePath = `products/${imageName}`;
         const blob = bucket.file(filePath);
         const blobStream = blob.createWriteStream({
            metadata: {
               contentType: image.mimetype,
            },
         });
         blobStream.on("error", (err) => {
            console.error(err);
            res.status(500).json({ error: "Failed to upload image" });
         });
         blobStream.on("finish", async () => {
            await blob.makePublic();
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            const counterRef = db.collection("metadata").doc("counters");
            const counterDoc = await counterRef.get();
            let lastProductId = 0;
            if (counterDoc.exists) {
               lastProductId = counterDoc.data().lastProductId;
            }
            const newId = lastProductId + 1;
            const newProduct = {
               title,
               price,
               description,
               category,
               imageUrl: imageUrl,
            };
            await db
               .collection("products")
               .doc(newId.toString())
               .set(newProduct);
            await counterRef.update({ lastProductId: newId });

            // Add to sellersproduct collection
            const sellersProduct = {
               productId: newId.toString(),
               userId: userId,
            };
            await db.collection("sellersproduct").add(sellersProduct);

            res.status(201).json({
               message: "Product added successfully",
               data: newProduct,
            });
         });

         blobStream.end(image.buffer);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Something went wrong" });
      }
   },
];

exports.productsBySeller = async (req, res) => {
   try {
      const userId = req.params.uid;

      if (!userId) {
         return res.status(400).json({ error: "User ID is required" });
      }

      // Step 1: Get product IDs from sellersproduct collection for the specific user
      const sellersProductsSnapshot = await db
         .collection("sellersproduct")
         .where("userId", "==", userId)
         .get();

      if (sellersProductsSnapshot.empty) {
         return res
            .status(404)
            .json({ message: "No products found for this user" });
      }

      const productIds = [];
      sellersProductsSnapshot.forEach((doc) => {
         productIds.push(doc.data().productId);
      });

      // Step 2: Get product details from products collection for the fetched product IDs
      const productsPromises = productIds.map((productId) =>
         db.collection("products").doc(productId).get()
      );
      const productsSnapshots = await Promise.all(productsPromises);

      const products = productsSnapshots.map((snapshot) => ({
         id: snapshot.id,
         ...snapshot.data(),
      }));

      res.status(200).json(products);
   } catch (error) {
      console.error("Error fetching products by seller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
