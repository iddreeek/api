const { db, bucket } = require('../util/admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.burgers = async (req, res) => {
    try {
        const burgersRef = db.collection('burgers');
        const snapshot = await burgersRef.get();
        if (snapshot.empty) {
            res.status(404).send('No matching documents.');
            return;
        }
        const burgers = [];
        snapshot.forEach(doc => {
            burgers.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).send(burgers);
    } catch (error) {
        res.status(500).send('Error getting documents: ' + error.message);
    }
}

exports.burgersById = async (req, res) => {
    try {
        const burgerId = req.params.id;
        const burgerRef = db.collection('burgers').doc(burgerId);
        const doc = await burgerRef.get();
        if (!doc.exists) {
            res.status(404).send('No such document!');
            return;
        }
        res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).send('Error getting document: ' + error.message);
    }
}

exports.burgersPost = [
    upload.single('image'), // Middleware to handle single file upload with field name 'image'
    async (req, res) => {
        try {
            const { name, price } = req.body;
            const image = req.file;
            if (!image) {
                return res.status(400).json({ error: 'Image file is required' });
            }

            const imageName = `${uuidv4()}_${image.originalname}`;
            const filePath = `burgers/${imageName}`;
            const blob = bucket.file(filePath);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: image.mimetype
                }
            });

            blobStream.on('error', (err) => {
                console.error(err);
                res.status(500).json({ error: 'Failed to upload image' });
            });

            blobStream.on('finish', async () => {
                // Make the blob public
                await blob.makePublic();
                // Construct the public URL
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
                
                // Update Firestore with new burger entry
                const counterRef = db.collection('metadata').doc('counters');
                const counterDoc = await counterRef.get();
                let lastBurgerId = 0;
                if (counterDoc.exists) {
                    lastBurgerId = counterDoc.data().lastBurgerId;
                }
                const newId = lastBurgerId + 1;

                // Save burger details to Firestore
                const newBurger = {
                    name,
                    price,
                    imageUrl: imageUrl
                };
                await db.collection('burgers').doc(newId.toString()).set(newBurger);
                await counterRef.update({ lastBurgerId: newId });

                res.status(201).json({ message: 'Burger added successfully', data: newBurger });
            });

            blobStream.end(image.buffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
];
