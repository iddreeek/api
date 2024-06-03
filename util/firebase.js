
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuXr7YK0vSVzN8YdytMpyHPXIVdx0_55Q",
  authDomain: "pos-system-83951.firebaseapp.com",
  projectId: "pos-system-83951",
  storageBucket: "pos-system-83951.appspot.com",
  messagingSenderId: "173847564607",
  appId: "1:173847564607:web:a8ca028b4b77eed095038a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig); //initialize firebase app 
module.exports = { firebase }; //export the app