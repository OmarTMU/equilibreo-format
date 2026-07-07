// pepsi12

const { initializeApp } = require("firebase/app");

const {
    getFirestore,
    doc,
    setDoc
} = require("firebase/firestore");

const {
    getAuth,
    signInWithEmailAndPassword
} = require("firebase/auth");

const fs = require("fs");
const readline = require("readline");


const firebaseConfig = {
    apiKey: "AIzaSyDyG0Sv22MpAL8z4GC8CYj5z0UoCqB4bqc",
    authDomain: "equilibreo.firebaseapp.com",
    projectId: "equilibreo",
    storageBucket: "equilibreo.firebasestorage.app",
    messagingSenderId: "661319732393",
    appId: "1:661319732393:web:5ebd35db44e1bc8d87adb8",
    measurementId: "G-15E529WTLQ"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);


const cards = JSON.parse(
    fs.readFileSync("cards.json", "utf8")
);


// Ask questions in terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}


async function uploadCards() {

    try {

        const email = await ask("Firebase email: ");
        const password = await ask("Firebase password: ");

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Logged in successfully");


        for (const card of cards) {

            const cardID = card.name
                .toLowerCase()
                .replaceAll(" ", "-");


            await setDoc(
                doc(db, "cards", cardID),
                card
            );


            console.log("Uploaded:", card.name);
        }


        console.log("Finished uploading!");

        rl.close();

        process.exit(0);


    } catch (error) {

        console.error("Upload failed:");
        console.error(error);

        rl.close();

        process.exit(0);
    }

}


uploadCards();