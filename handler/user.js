const { db } = require("../util/admin");

exports.users = async (req, res) => {
   const { userId, email } = req.body;

   try {
      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
         await userRef.set({
            id: userId,
            email: email,
            role: "user", // Default role
         });
      }

      const user = await userRef.get();
      res.status(200).json(user.data());
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch or create user" });
   }
};
