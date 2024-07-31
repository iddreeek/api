const { db, bucket } = require('../util/admin');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.drinks = async (req, res) => {
    try {
        const drinksRef = db.collection('drinks');
        const snapshot = await drinksRef.get();
        if (snapshot.empty) {
            res.status(404).send('No matching documents.');
            return;
        }
        const drinks = [];
        snapshot.forEach(doc => {
            drinks.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).send(drinks);
    } catch (error) {
        res.status(500).send('Error getting documents: ' + error.message);
    }
}

exports.drinksById = async (req, res) => {
    try {
        const drinkId = req.params.id;
        const drinkRef = db.collection('drinks').doc(drinkId);
        const doc = await drinkRef.get();
        if (!doc.exists) {
            res.status(404).send('No such document!');
            return;
        }
        res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).send('Error getting document: ' + error.message);
    }
}

exports.drinksPost = [
    upload.single('image'), // Middleware to handle single file upload with field name 'image'
    async (req, res) => {
        try {
            const { name, price } = req.body;
            const image = req.file;
            if (!image) {
                return res.status(400).json({ error: 'Image file is required' });
            }

            const imageName = `${uuidv4()}_${image.originalname}`;
            const filePath = `drinks/${imageName}`;
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
                
                // Update Firestore with new drink entry
                const counterRef = db.collection('metadata').doc('counters');
                const counterDoc = await counterRef.get();
                let lastdrinkId = 0;
                if (counterDoc.exists) {
                    lastdrinkId = counterDoc.data().lastdrinkId;
                }
                const newId = lastdrinkId + 1;

                // Save drink details to Firestore
                const newdrink = {
                    name,
                    price,
                    imageUrl: imageUrl
                };
                await db.collection('drinks').doc(newId.toString()).set(newdrink);
                await counterRef.update({ lastdrinkId: newId });

                res.status(201).json({ message: 'drink added successfully', data: newdrink });
            });

            blobStream.end(image.buffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
];
