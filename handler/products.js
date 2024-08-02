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
      const { title, price, description, category } = req.body;
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
        await db.collection("products").doc(newId.toString()).set(newProduct);
        await counterRef.update({ lastProductId: newId });
        res
          .status(201)
          .json({ message: "Product added successfully", data: newProduct });
      });

      blobStream.end(image.buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
];
