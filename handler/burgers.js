const { db } = require('../util/admin')

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

exports.burgersPost = async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name || !price) {
            res.status(400).send('Bad Request: Missing required fields');
            return;
        }

        const counterRef = db.collection('metadata').doc('counters');
        const counterDoc = await counterRef.get();

        let lastBurgerId = 0;
        if (counterDoc.exists) {
            lastBurgerId = counterDoc.data().lastBurgerId;
        }

        const newId = lastBurgerId + 1;

        const newBurger = {
            name,
            price,
        };

        await db.collection('burgers').doc(newId.toString()).set(newBurger);

        await counterRef.update({ lastBurgerId: newId });

        res.status(201).send(`Burger created with ID: ${newId}`);
    } catch (error) {
        console.error('Error creating burger:', error);
        res.status(500).send('Internal Server Error');
    }
}