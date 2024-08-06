
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0ge8hdNDv7mjWh1IuINba9hLYhcBr5AE",
  authDomain: "online-shop-ej1117.firebaseapp.com",
  projectId: "online-shop-ej1117",
  storageBucket: "online-shop-ej1117.appspot.com",
  messagingSenderId: "898273371992",
  appId: "1:898273371992:web:2ddb940d8d84008a57272d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig); //initialize firebase app 
module.exports = { firebase }; //export the app