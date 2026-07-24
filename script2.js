// firebase set up
import { 
    getFirestore, 
    collection,
    getDoc, 
    getDocs,
    doc,
    setDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDyG0Sv22MpAL8z4GC8CYj5z0UoCqB4bqc",
    authDomain: "equilibreo.firebaseapp.com",
    projectId: "equilibreo",
    storageBucket: "equilibreo.firebasestorage.app",
    messagingSenderId: "661319732393",
    appId: "1:661319732393:web:5ebd35db44e1bc8d87adb8",
    measurementId: "G-15E529WTLQ"
};
//format select
const formatSelect = document.getElementById("format-select");
let currentFormat = formatSelect.value;

formatSelect.addEventListener("change", async () => {

    currentFormat = formatSelect.value;

    clearDeckDisplay();   // <-- add this
    clearDeckList();      // optional, clears dropdown temporarily

    await loadCards();
    await loadUserDecks();

});
//


function getDeckCollection(){

    console.log("CURRENT FORMAT:", currentFormat);

    if(currentFormat === "cards"){
        return "decks";
    }

    if(currentFormat === "cards2"){
        return "decks2";
    }

    console.log("INVALID FORMAT!");
}

function getDefaultDeckField(){

    if(currentFormat === "cards"){
        return "defaultCardsDeck";
    }

    if(currentFormat === "cards2"){
        return "defaultCards2Deck";
    }

}

function unlocksearch() {

    const searchSection = document.getElementById("search-section");

    const elements = searchSection.querySelectorAll(
        "button, input, select"
    );

    elements.forEach(element => {
        element.disabled = false;
  })

    document.getElementById("export").disabled = false;
    document.getElementById("clear-deck").disabled = false;
}


  function setWebsiteLocked(locked){

    const elements = document.querySelectorAll(
        "button, input, select"
    );

    elements.forEach(element => {

        // do not disable login/register/logout
        if(
            element.id === "login-btn" ||
            element.id === "register-btn" ||
            element.id === "logout-btn" ||
            element.id === "username" ||
            element.id === "password"
        ){
            return;
        }


        element.disabled = locked;

    });


    // disable dragging cards
    const cards = document.querySelectorAll(
        ".card-ui, .deck-card"
    );


    cards.forEach(card=>{

        card.draggable = !locked;

    });


    if(locked){
        errorMsg.innerText = "Please login to use the deck builder.";
    }
    else{
        errorMsg.innerText = "Logged in!";
    }

}

function clearDeckDisplay(){

    const deckSlots = document.querySelectorAll(
        ".main-deck-grid .card-slot, .extra-deck-grid .card-slot, .side-deck-grid .card-slot"
    );

    deckSlots.forEach(slot => {
        slot.innerHTML = "";
    });

}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

// check login status
onAuthStateChanged(auth, async (user)=>{

    if(user){

        currentUser = user;
    
        console.log("Logged in:", user.uid);
    
        setWebsiteLocked(false);
    
        updateAuthButtons(true);
    
        await loadUserDecks();
    
        errorMsg.innerText =
        "Logged in as: " + user.email.split("@")[0];
    
    }
    else{

        currentUser = null;
    
        console.log("Not logged in");
    
        clearDeckDisplay();
    
        clearDeckList();
    
        setWebsiteLocked(true);

        unlocksearch();
    
        updateAuthButtons(false);
    
        errorMsg.innerText = "Log in or register to use all features!";
    
    }

});

// register
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");

const errorMsg = document.getElementById("error-msg");

registerBtn.addEventListener("click", async () => {

    const username = usernameInput.value.trim();
    const password = passwordInput.value;


    if(username === "" || password === ""){

        errorMsg.innerText = 
        "Please enter a username and password.";

        return;
    }


    const email = username + "@equilibreo.com";


    try{

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // create default Equilibreo deck
await setDoc(
    doc(
        db,
        "users",
        user.uid,
        "decks",
        "deck1"
    ),
    {
        name:"Deck 1",
        main:[],
        extra:[],
        side:[]
    }
);


// create default Classic deck
await setDoc(
    doc(
        db,
        "users",
        user.uid,
        "decks2",
        "deck1"
    ),
    {
        name:"Deck 1",
        main:[],
        extra:[],
        side:[]
    }
);

        console.log("Deck created for:", user.uid);
        errorMsg.innerText =
        "Account created successfully!";

    }

    catch(error){

        errorMsg.innerText = error.message;

    }

});

// login
loginBtn.addEventListener("click", async () => {


    if(auth.currentUser){

        errorMsg.innerText =
        "Already logged in as: " + auth.currentUser.email.split("@")[0];

        return;
    }


    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if(username === "" || password === ""){
        errorMsg.innerText = "Please enter a username and password.";
        return;
    }

    const email = username + "@equilibreo.com";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        errorMsg.innerText = "Logged in successfully!";

        console.log("Logged in:", auth.currentUser.uid);

    }

    catch(error){

        errorMsg.innerText = error.message;

    }

});

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        errorMsg.innerText = "Logged out successfully!";

    }

    catch(error){

        errorMsg.innerText = error.message;

    }

});

const deleteAccountBtn = document.getElementById("delete-account-btn");


deleteAccountBtn.addEventListener("click", async ()=>{

    if(!currentUser){
        alert("You must be logged in.");
        return;
    }


    const firstConfirm = confirm(
        "Are you sure you want to delete your account?\n\nThis will also permanently delete all your decks."
    );
    
    if(!firstConfirm){
        return;
    }
    
    const secondConfirm = confirm(
        "FINAL WARNING:\n\nYour account and all saved decks will be permanently deleted.\n\nContinue?"
    );
    
    if(!secondConfirm){
        return;
    }


    try{

        const uid = currentUser.uid;


        // delete all decks
        const decksSnapshot = await getDocs(
            collection(db, "users", uid, getDeckCollection())
        );


        for(const deckDoc of decksSnapshot.docs){

            await deleteDoc(deckDoc.ref);

        }


        // delete user document
        await deleteDoc(
            doc(db, "users", uid)
        );


        // delete authentication account
        await deleteUser(currentUser);


        alert("Account deleted.");

    }

    catch(error){

        console.log(error);
        errorMsg.innerText = error.message;

    }

});

function updateAuthButtons(loggedIn){

    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const deleteBtn = document.getElementById("delete-account-btn");


    if(loggedIn){

        loginBtn.style.display = "none";
        registerBtn.style.display = "none";

        logoutBtn.style.display = "inline";
        deleteBtn.style.display = "inline";

    }
    else{

        loginBtn.style.display = "inline";
        registerBtn.style.display = "inline";

        logoutBtn.style.display = "none";
        deleteBtn.style.display = "none";

    }

}
//

const cardType = document.getElementById("card-type");

const monsterBackground = document.getElementById("monster-background");
const cardSubtype = document.getElementById("card-subtype");
const monsterMechanic = document.getElementById("monster-mechanic");

const attribute = document.getElementById("attribute-select");

const levelMin = document.getElementById("level-min");
const levelMax = document.getElementById("level-max");

const atkMin = document.getElementById("atk-min");
const atkMax = document.getElementById("atk-max");

const defMin = document.getElementById("def-min");
const defMax = document.getElementById("def-max");

const limitSelect = document.getElementById("limit-select");

const monsterSubtypes = [ "", "aqua", "beast", "beast-warrior", "dinosaur", "dragon",
    "fairy", "fiend", "fish", "insect", "machine", "psychic",
    "pyro", "reptile", "rock", "sea-serpent", "spellcaster",
    "thunder", "warrior", "winged-beast", "wyrm", "zombie"
];
const spellSubtypes = ["", "normal", "continuous", "quick-play", "field", "equip", "ritual"];
const trapSubtypes = ["", "normal", "continuous", "counter"];

const filterList = [
    monsterBackground, // normal, fusion
    cardSubtype, // dragon, quick-play, counter
    monsterMechanic, // tuner, gemini
    attribute,
    levelMin,
    levelMax,
    atkMin,
    atkMax,
    defMin,
    defMax,
    limitSelect
];

function updateSubtype() {

    if (cardType.value === "monster") {
        for (let i = 0; i < filterList.length; i++) {
            filterList[i].disabled = false;
        }
        cardSubtype.innerHTML = "";
        for (let i = 0; i < monsterSubtypes.length; i++) {
            const option = document.createElement("option");
            option.value = monsterSubtypes[i];
            option.textContent = monsterSubtypes[i];
            cardSubtype.appendChild(option);
        }
    } else if (cardType.value === "spell") {
        for (let i = 0; i < filterList.length; i++) {
            filterList[i].disabled = true;
            filterList[i].value = "";
        }
        filterList[1].disabled = false;
        filterList[filterList.length - 1].disabled = false;
        cardSubtype.innerHTML = "";
        for (let i = 0; i < spellSubtypes.length; i++) {
            const option = document.createElement("option");
            option.value = spellSubtypes[i];
            option.textContent = spellSubtypes[i];
            cardSubtype.appendChild(option);
        }
    } else if (cardType.value === "trap") {
        for (let i = 0; i < filterList.length; i++) {
            filterList[i].disabled = true;
            filterList[i].value = "";
        }
        filterList[1].disabled = false;
        filterList[filterList.length - 1].disabled = false;
        cardSubtype.innerHTML = "";
        for (let i = 0; i < trapSubtypes.length; i++) {
            const option = document.createElement("option");
            option.value = trapSubtypes[i];
            option.textContent = trapSubtypes[i];
            cardSubtype.appendChild(option);
          }
    } else if (cardType.value === "") {
        for (let i = 0; i < filterList.length; i++) {
            filterList[i].disabled = true;
            filterList[i].value = "";
        }
        filterList[filterList.length - 1].disabled = false;
    }
}

cardType.addEventListener("change", updateSubtype);

// ------------------------------------------------------------------------------------------------------------------------

// create deck , delete deck
const selectDeck = document.getElementById("select-deck");
const setDefaultDeckBtn = document.getElementById("set-default-deck");
const newDeckBtn = document.getElementById("new-deck");
const deleteDeckBtn = document.getElementById("delete");
const saveDeckBtn = document.getElementById("save");
const saveAsBtn = document.getElementById("save-as");
const clearDeckBtn = document.getElementById("clear-deck");
const exportBtn = document.getElementById("export");
const importBtn = document.getElementById("import");
const importFile = document.getElementById("import-file");
let deckChanged = false;
let previousDeck = null;
let loadingDeck = false;

clearDeckBtn.addEventListener("click", ()=>{

    /*
    if(!currentUser){
        alert("Login first.");
        return;
    }
    */

    const confirmClear = confirm(
        "Are you sure you want to clear this deck?"
    );


    if(!confirmClear){
        return;
    }


    clearDeckDisplay();
    deckChanged = true;

});

selectDeck.addEventListener("change", async ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }

    if(deckChanged){

        const save = confirm(
            "You have UNSAVED changes.\n\nPress OK to save before switching decks.\nPress Cancel to discard changes."
        );


        if(save){

            await saveCurrentDeck();

        }

    }


    clearDeckDisplay();

    await loadSelectedDeck();

    previousDeck = selectDeck.value;
    deckChanged = false;


});

function getCardsFromGrid(gridID){

    const cards = [];

    const grid = document.getElementById(gridID);

    const deckCards = grid.querySelectorAll(".deck-card");


    deckCards.forEach(card=>{

        cards.push({

            id: getCardIDFromImage(card.dataset.image),
            name: card.dataset.name,
            image: card.dataset.image,
            cardType: card.dataset.type,
            subType: card.dataset.subtype,
            monsterBackground: card.dataset.background,
            monsterMechanic: card.dataset.mechanic,
            attribute: card.dataset.attribute,
            level: card.dataset.level,
            atk: card.dataset.atk,
            def: card.dataset.def,
            description: decodeURIComponent(card.dataset.desc ?? ""),
            limit: card.dataset.limit

        });

    });


    return cards;

}


function getCardIDFromImage(imagePath){

    const filename = imagePath.split("/").pop();

    const id = filename.replace(".jpg","");

    return id;

}

function exportYDK(){

    let ydk = "#created by ...\n\n";


    ydk += "#main\n";

    const mainCards = getCardsFromGrid("main-deck-grid");

    mainCards.forEach(card=>{

        ydk += card.id + "\n";

    });



    ydk += "#extra\n";

    const extraCards = getCardsFromGrid("extra-deck-grid");

    extraCards.forEach(card=>{

        ydk += card.id + "\n";

    });



    ydk += "!side\n";

    const sideCards = getCardsFromGrid("side-deck-grid");

    sideCards.forEach(card=>{

        ydk += card.id + "\n";

    });


    downloadYDK(ydk);

}

function downloadYDK(content){

    const blob = new Blob(
        [content],
        {type:"application/octet-stream"}
    );


    const url = URL.createObjectURL(blob);


    const a = document.createElement("a");

    a.href = url;

    a.download = "deck.ydk";

    a.click();


    URL.revokeObjectURL(url);

}

exportBtn.addEventListener("click", ()=>{

    /*
    if(!currentUser){
        alert("Login first.");
        return;
    }
    */

    exportYDK();

});

importBtn.addEventListener("click", ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }

    importFile.click();

});


importFile.addEventListener("change", async ()=>{

    const file = importFile.files[0];

    if(!file){
        return;
    }

    const ydk = await file.text();

    // console.log("FILE SIZE:", file.size);
    // console.log("RAW FILE:", JSON.stringify(ydk));

    await importYDK(ydk);

    importFile.value = "";

});

function clearDeckList(){

    selectDeck.innerHTML = "";

}

async function loadUserDecks(){

    if(!currentUser){
        return;
    }

    const deckCollection = getDeckCollection();

    const deckSelect = document.getElementById("select-deck");
    
    deckSelect.innerHTML = "";
    
    
    const decksSnapshot = await getDocs(
        collection(
            db,
            "users",
            currentUser.uid,
            deckCollection
        )
    );

    if(decksSnapshot.empty){

        await setDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                deckCollection,
                "deck1"
            ),
            {
                name: "Deck 1",
                main: [],
                extra: [],
                side: []
            }
        );
    
    }

    const updatedDecksSnapshot = await getDocs(
        collection(
            db,
            "users",
            currentUser.uid,
            deckCollection
        )
    );


    updatedDecksSnapshot.forEach((deckDoc)=>{

        const deckData = deckDoc.data();

        const option = document.createElement("option");

        option.value = deckDoc.id;
        option.textContent = deckData.name;

        deckSelect.appendChild(option);

    });


    // load default deck if it exists

    const userSnapshot = await getDoc(
        doc(
            db,
            "users",
            currentUser.uid
        )
    );

    const userData = userSnapshot.data();


    if(
        userData &&
        userData[getDefaultDeckField()] &&
        document.querySelector(
            `#select-deck option[value="${userData[getDefaultDeckField()]}"]`
        )
    ){

        deckSelect.value = userData[getDefaultDeckField()];

    }
    else{

        // select default deck if it exists, otherwise first deck

    const userSnapshot = await getDoc(
        doc(
            db,
            "users",
            currentUser.uid
        )
    );

    const userData = userSnapshot.data();


    let defaultFound = false;


    if(userData && userData[getDefaultDeckField()]){

        for(const option of selectDeck.options){

            if(option.value === userData[getDefaultDeckField()]){

                selectDeck.value = userData[getDefaultDeckField()];
                defaultFound = true;
                break;

            }

        }

    }


    if(!defaultFound && selectDeck.options.length > 0){

        selectDeck.selectedIndex = 0;

    }


    }

    await loadSelectedDeck();
    

}

async function loadSelectedDeck(){

    if(!currentUser){
        return;
    }


    const deckID = selectDeck.value;

    if(!deckID){
        return;
    }


    const deckSnapshot = await getDocs(
        collection(
            db,
            "users",
            currentUser.uid,
            getDeckCollection()
        )
    );


    let selectedDeckData = null;


    deckSnapshot.forEach(deckDoc=>{

        if(deckDoc.id === deckID){

            selectedDeckData = deckDoc.data();

        }

    });


    if(!selectedDeckData){
        return;
    }


    // clear old cards first
    clearDeckDisplay();

    loadingDeck = true;


    selectedDeckData.main.forEach(savedCard=>{

        const latestCard = findCardByID(savedCard.id);
    
        if(latestCard && Number(latestCard.limit) > 0){

            addCardToDeck(
                latestCard,
                "main-deck-grid"
            );
        
        }
    
    });
    
    
    selectedDeckData.extra.forEach(savedCard=>{
    
        const latestCard = findCardByID(savedCard.id);
    
        if(latestCard && Number(latestCard.limit) > 0){

            addCardToDeck(
                latestCard,
                "extra-deck-grid"
            );
        
        }
    
    });
    
    
    selectedDeckData.side.forEach(savedCard=>{
    
        const latestCard = findCardByID(savedCard.id);
    
        if(latestCard && Number(latestCard.limit) > 0){

            addCardToDeck(
                latestCard,
                "side-deck-grid"
            );
        
        }
    
    });

previousDeck = deckID;
deckChanged = false;
loadingDeck = false;

}

setDefaultDeckBtn.addEventListener("click", async ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }


    const deckID = selectDeck.value;


    if(!deckID){
        alert("No deck selected.");
        return;
    }

    const defaultField = getDefaultDeckField();


await setDoc(
    doc(
        db,
        "users",
        currentUser.uid
    ),
    {
        [defaultField]: deckID
    },
    {
        merge:true
    }
);

    const deckName = selectDeck.options[selectDeck.selectedIndex].textContent;

    alert(deckName + " is now your default deck!");


});

newDeckBtn.addEventListener("click", async function () {

    if(!currentUser){
        alert("Login first.");
        return;
    }

    if(deckChanged){

        const save = confirm(
            "You have UNSAVED changes.\n\nOK = Save before creating new deck.\nCancel = discard changes before creating new deck."
        );
    
    
        if(save){
    
            await saveCurrentDeck();
    
        }
    
    }


    let deckName = prompt("Enter deck name:");

    if (!deckName) return;

    deckName = getUniqueDeckName(deckName);


    // create Firebase deck
    await setDoc(
        doc(
            db,
            "users",
            currentUser.uid,
            getDeckCollection(),
            deckName
        ),
        {
            name: deckName,
            main: [],
            extra: [],
            side: []
        }
    );


    // add it to dropdown
    const option = document.createElement("option");

    option.value = deckName;
    option.textContent = deckName;

    selectDeck.appendChild(option);


    // select new deck
    selectDeck.value = deckName;


    // clear current cards because new deck is empty
    clearDeckDisplay();

    previousDeck = deckName;
    deckChanged = false;

    alert("Deck created!");

});

saveAsBtn.addEventListener("click", async ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }

    if(deckChanged){
        const save = confirm(
            "You have UNSAVED changes.\n\nOK = Save changes before Save As.\nCancel = Continue without saving."
        );
    
        if(save){
    
            await saveCurrentDeck();
    
        }
    }

    let deckName = prompt("Save deck as:");

    if(!deckName){
        return;
    }

    deckName = getUniqueDeckName(deckName);

    await setDoc(

        doc(
            db,
            "users",
            currentUser.uid,
            getDeckCollection(),
            deckName
        ),

        {
            name: deckName,
            main: getCardsFromGrid("main-deck-grid"),
            extra: getCardsFromGrid("extra-deck-grid"),
            side: getCardsFromGrid("side-deck-grid")
        }

    );

    const option = document.createElement("option");

    option.value = deckName;
    option.textContent = deckName;

    selectDeck.appendChild(option);

    selectDeck.value = deckName;

    previousDeck = deckName;
    deckChanged = false;

    alert("Deck saved as '" + deckName + "'!");

});

function getUniqueDeckName(name, ignoreDeckID = null){

    let newName = name.trim();

    while(true){

        let exists = false;

        const options = Array.from(selectDeck.options);

        for(const option of options){

            // ignore the current deck when renaming
            if(option.value === ignoreDeckID){
                continue;
            }

            if(option.textContent === newName){
                exists = true;
                break;
            }
        }


        if(!exists){
            return newName;
        }


        newName += " (1)";
    }

}

deleteDeckBtn.addEventListener("click", async function () {

    if(!currentUser){
        alert("Login first.");
        return;
    }


    // cannot delete last deck
    if(selectDeck.options.length <= 1){
        alert("You must have at least one deck.");
        return;
    }


    const deckID = selectDeck.value;

    previousDeck = deckID;
    deckChanged = false;

    if(!deckID){
        return;
    }


    const confirmDelete = confirm(
        "Are you sure you want to delete this deck?"
    );


    if(!confirmDelete){
        return;
    }


    try{

        const userSnapshot = await getDoc(
            doc(
                db,
                "users",
                currentUser.uid
            )
        );
        
        const userData = userSnapshot.data();
        
        const wasDefaultDeck = 
            userData && userData[getDefaultDeckField()] === deckID;
         //   console.log("Deleting:", deckID);
    // console.log("Saved default:", userData[getDefaultDeckField()]);
// console.log("Was default?", wasDefaultDeck);
        // delete from Firebase
        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                getDeckCollection(),
                deckID
            )
        );



        // remove from dropdown
        const selectedOption = selectDeck.selectedIndex;

        selectDeck.remove(selectedOption);


        // automatically set first remaining deck as default

        // only change default if the deleted deck was the default

if(wasDefaultDeck && selectDeck.options.length > 0){

    selectDeck.selectedIndex = 0;


    await setDoc(

        doc(
            db,
            "users",
            currentUser.uid
        ),

        {
            [getDefaultDeckField()]: selectDeck.value
        },

        {
            merge:true
        }

    );

}

        // load the new selected deck
// restore selected deck to default

const userSnapshot2 = await getDoc(
    doc(
        db,
        "users",
        currentUser.uid
    )
);

const userData2 = userSnapshot2.data();


let foundDefault = false;


if(userData2 && userData2[getDefaultDeckField()]){

    for(const option of selectDeck.options){

        if(option.value === userData2[getDefaultDeckField()]){

            selectDeck.value = userData2[getDefaultDeckField()];
            foundDefault = true;
            break;

        }

    }

}


if(!foundDefault){

    selectDeck.selectedIndex = 0;

}


clearDeckDisplay();

await loadSelectedDeck();


        alert("Deck deleted!");

    }

    catch(error){

        console.log(error);
        alert(error.message);

    }

});

async function saveCurrentDeck(){

    if(!currentUser){
        return;
    }

    const deckID = previousDeck ?? selectDeck.value;

    if(!deckID){
        return;
    }


    await setDoc(

        doc(db, "users", currentUser.uid, getDeckCollection(), deckID),

        {
            main: getCardsFromGrid("main-deck-grid"),
            extra: getCardsFromGrid("extra-deck-grid"),
            side: getCardsFromGrid("side-deck-grid")
        },

        {
            merge:true
        }

    );

    deckChanged = false;

}

saveDeckBtn.addEventListener("click", async ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }

    await saveCurrentDeck();

    alert("Deck saved!");

});

const renameDeckBtn = document.getElementById("rename");

renameDeckBtn.addEventListener("click", async ()=>{

    if(!currentUser){
        alert("Login first.");
        return;
    }


    const deckID = selectDeck.value;


    if(!deckID){
        alert("No deck selected.");
        return;
    }


    const currentName = 
        selectDeck.options[selectDeck.selectedIndex].textContent;


    let newName = prompt(
        "Enter new deck name:",
        currentName
    );


    if(!newName || newName.trim() === ""){
        return;
    }


    newName = getUniqueDeckName(newName, deckID);


    await setDoc(

        doc(
            db,
            "users",
            currentUser.uid,
            getDeckCollection(),
            deckID
        ),

        {
            name: newName
        },

        {
            merge:true
        }

    );


    selectDeck.options[
        selectDeck.selectedIndex
    ].textContent = newName;


    alert("Deck renamed!");

});

async function importYDK(ydk){


    let deckName = prompt(
        "Enter imported deck name:"
    );


    if(!deckName){
        return;
    }


    deckName = getUniqueDeckName(deckName);



    let section = "";


    const main = [];
    const extra = [];
    const side = [];


    const lines = ydk.split(/\r?\n/);


    for(let line of lines){

        line = line.trim();

     //   console.log("LINE:", line);
        

        if(line === "#main"){

            section = "main";
            continue;

        }


        if(line === "#extra"){

            section = "extra";
            continue;

        }


        if(line === "!side"){

            section = "side";
            continue;

        }


        if(
            line === "" ||
            line.startsWith("#")
        ){
            continue;
        }



        const card = findCardByID(line);

// console.log("SEARCHING:", line);
// console.log("FOUND:", card);



        if(!card){

            /*
            console.log(
                "Card not found:",
                line
            );
            */

            continue;

        }



        if(section === "main"){

            main.push({
                ...card,
                id: line
            });
        
        }

        else if(section === "extra"){

            extra.push({
                ...card,
                id: line
            });
        
        }
        
        else if(section === "side"){
        
            side.push({
                ...card,
                id: line
            });
        
        }

    }



    // create new Firebase deck

    await setDoc(

        doc(
            db,
            "users",
            currentUser.uid,
            getDeckCollection(),
            deckName
        ),

        {

            name: deckName,
            main: main,
            extra: extra,
            side: side

        }

    );



    // add new deck to dropdown

    const option = document.createElement("option");

    option.value = deckName;
    option.textContent = deckName;


    selectDeck.appendChild(option);



    // automatically switch to imported deck

    selectDeck.value = deckName;


    clearDeckDisplay();


    await loadSelectedDeck();



    deckChanged = false;


    alert("Deck imported!");

}


// online search
let searchResults = [];
let allCards = [];
let filteredCards = [];

const imageCache = new Map();

let currentPage = 1;
const pageSize = 20;

const nextBtn = document.getElementById("next-page");
const prevBtn = document.getElementById("prev-page");
const pageNumber = document.getElementById("page-number");

const searchButton = document.getElementById("search-button");

function updatePageButtons() {

    const maxPage = Math.max(
        1,
        Math.ceil(filteredCards.length / pageSize)
    );


    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= maxPage;


    pageNumber.innerText =
        currentPage + "/" + maxPage;

}

// render page function
function renderPage() {

    const slots = document.querySelectorAll(".search-grid .card-slot");


    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const pageItems = filteredCards.slice(start, end);


    slots.forEach(slot => slot.innerHTML = "");


    pageItems.forEach((card, index) => {

        if (!slots[index]) return;

        slots[index].innerHTML = `
            <div class="card-ui" draggable="true"
                 data-id="${card.id ?? getCardIDFromImage(card.image)}"
                 data-name="${card.name}"
                 data-image="${card.image ?? ""}"
                 data-type="${card.cardType}"
                 data-subtype="${card.subType}"
                 data-background="${card.monsterBackground ?? ""}"
                 data-attribute="${card.attribute ?? ""}"
                 data-level="${card.level ?? ""}"
                 data-atk="${card.atk ?? ""}"
                 data-def="${card.def ?? ""}"
                 data-desc="${encodeURIComponent(card.description ?? "")}"
                 data-limit="${card.limit ?? 1}">

                 <img class="card-pic" src="${imageCache.get(card.image)?.src ?? card.image}" alt="${card.name}">
            ${
                card.limit == 1 
                ? `<div class="limit-badge">1</div>`
                : card.limit == 2
                ? `<div class="limit-badge">2</div>`
                : ""
            }
                        </div>
                    `;

    });

    updatePageButtons();
}

// CLICK SEARCH CARD TO ADD TO DECK

document.addEventListener("click", (e) => {

    const cardUI = e.target.closest(".card-ui, .deck-card");

    if (!cardUI) return;

    const card = {
        name: cardUI.dataset.name,
        image: cardUI.dataset.image,
        cardType: cardUI.dataset.type,
        subType: cardUI.dataset.subtype,
        attribute: cardUI.dataset.attribute,
        level: cardUI.dataset.level,
        atk: cardUI.dataset.atk,
        def: cardUI.dataset.def,
        description: decodeURIComponent(cardUI.dataset.desc ?? ""),
        monsterBackground: cardUI.dataset.background,
        limit: cardUI.dataset.limit
    };


    // fusion / xyz goes extra deck
    if(card.monsterBackground === "fusion" || card.monsterBackground === "xyz"){
        addCardToDeck(card, "extra-deck-grid");
    }
    else{
        addCardToDeck(card, "main-deck-grid");
    }

});




async function loadCards() {

    const response = await fetch(`${currentFormat}.json`);

    const cards = await response.json();

    // Only keep cards that are allowed in the format
    allCards = cards.filter(card => Number(card.limit) > 0);

    filteredCards = [...allCards];

    console.log("JSON cards loaded:", allCards.length);

    preloadCardImages(allCards);

    renderPage();
}



function preloadCardImages(cards){

    console.log("Preloading card images...");

    cards.forEach(card=>{

        if(imageCache.has(card.image)){
            return;
        }

        const img = new Image();

        img.src = card.image;

        imageCache.set(card.image, img);

    });

    console.log("Images stored:", imageCache.size);

}

let draggedSlot = null;

document.addEventListener("dragstart", e => {

    const card = e.target.closest(".deck-card, .card-ui");

    if(!card) return;


    const cardData = {
        name: card.dataset.name,
        image: card.dataset.image,
        cardType: card.dataset.type,
        subType: card.dataset.subtype,
        monsterBackground: card.dataset.background,
        monsterMechanic: card.dataset.mechanic,
        attribute: card.dataset.attribute,
        level: card.dataset.level,
        atk: card.dataset.atk,
        def: card.dataset.def,
        description: decodeURIComponent(card.dataset.desc ?? ""),
        limit: card.dataset.limit
    };


    e.dataTransfer.setData(
        "card",
        JSON.stringify(cardData)
    );


    // if it is already inside a deck, remember its slot
    if(card.classList.contains("deck-card")){

        draggedSlot = card.parentElement;
    
        e.dataTransfer.setData(
            "moving",
            "true"
        );
    
    }
    else{
    
        draggedSlot = null;
    
        e.dataTransfer.setData(
            "moving",
            "false"
        );
    
    }

});

function getCardCountInDecks(cardName){

    let count = 0;


    const allDeckCards = document.querySelectorAll(".deck-card");


    allDeckCards.forEach(card => {

        if(card.dataset.name === cardName){
            count++;
        }

    });


    return count;

}

function addCardToGrid(card, area){

    const slots = area.querySelectorAll(".card-slot");

    for(let slot of slots){

        if(slot.innerHTML === ""){

            slot.innerHTML = `

            <div class="deck-card"
                 draggable="true"
                 data-id="${card.id ?? getCardIDFromImage(card.image)}"
                 data-name="${card.name}"
                 data-image="${card.image ?? ""}"
                 data-type="${card.cardType}"
                 data-subtype="${card.subType}"
                 data-background="${card.monsterBackground ?? ""}"
                 data-mechanic="${card.monsterMechanic ?? ""}"
                 data-attribute="${card.attribute ?? ""}"
                 data-level="${card.level ?? ""}"
                 data-atk="${card.atk ?? ""}"
                 data-def="${card.def ?? ""}"
                 data-desc="${encodeURIComponent(card.description ?? "")}"
                 data-limit="${card.limit ?? 1}">
                 <img src="${imageCache.get(card.image)?.src ?? card.image}" class="deck-card-image">
                

                 ${
                    card.limit == 1 
                    ? `<div class="limit-badge">1</div>`
                    : card.limit == 2
                    ? `<div class="limit-badge">2</div>`
                    : ""
                }

            </div>
            `;
            break;
        }
    }

}
/*
const deckAreas = document.querySelectorAll(
    ".main-deck-grid, .extra-deck-grid, .side-deck-grid"
);

deckAreas.forEach(area=>{

    area.addEventListener("dragover", e=>{
        e.preventDefault();
    });

    area.addEventListener("drop", e=>{

        e.preventDefault();

        const card = JSON.parse(
            e.dataTransfer.getData("card")
        );

        const destination = area.id;

        // restrictions

        if(
            destination === "main-deck-grid" &&
            card.monsterBackground === "fusion"
        ){
            return;
        }


        if(
            destination === "extra-deck-grid" &&
            card.monsterBackground !== "fusion"
        ){
            return;
        }

        const currentCount = getCardCountInDecks(card.name);

        if(currentCount >= Number(card.limit)){
            return;
        }

        addCardToGrid(card, area);

    });

});
*/

function applyFilters() {

    filteredCards = allCards.filter(card => {                       // allCards / filteredCards

        // TEXT FILTERS
        const name = (document.getElementById("card-name")?.value ?? "").trim().toLowerCase();
        const desc = (document.getElementById("card-description")?.value ?? "").trim().toLowerCase();
    
        const cardName = (card.name ?? "").toLowerCase();
        const cardDesc = (card.description ?? "").toLowerCase();
    
        const nameMatch = name === "" || cardName.includes(name);
        const descMatch = desc === "" || cardDesc.includes(desc);
    
        // TYPE FILTERS
        const cardType = document.getElementById("card-type")?.value ?? "";
        const cardSubtype = document.getElementById("card-subtype")?.value ?? "";
        const monsterBackground = document.getElementById("monster-background")?.value ?? "";
        const monsterMechanic = document.getElementById("monster-mechanic")?.value ?? "";
        const attribute = document.getElementById("attribute-select")?.value ?? "";
        const limitSelect = document.getElementById("limit-select")?.value ?? "";
    
        const typeMatch = cardType === "" || card.cardType === cardType;
        const subtypeMatch = cardSubtype === "" || card.subType === cardSubtype;
        const monsterBackgroundMatch = monsterBackground === "" || card.monsterBackground === monsterBackground;
        const mechanicMatch = monsterMechanic === "" || card.monsterMechanic === monsterMechanic;
        const attributeMatch = attribute === "" || card.attribute === attribute;
        const limitMatch = limitSelect === "" ||  Number(card.limit) === Number(limitSelect);
    
        // NUMERIC FILTERS
        const levelMin = parseInt(document.getElementById("level-min")?.value);
        const levelMax = parseInt(document.getElementById("level-max")?.value);
    
        const atkMin = parseInt(document.getElementById("atk-min")?.value);
        const atkMax = parseInt(document.getElementById("atk-max")?.value);
    
        const defMin = parseInt(document.getElementById("def-min")?.value);
        const defMax = parseInt(document.getElementById("def-max")?.value);
    
        const level = card.level ?? null;
        const atk = card.atk ?? null;
        const def = card.def ?? null;
    
        const levelMatch =
            (isNaN(levelMin) || level >= levelMin) &&
            (isNaN(levelMax) || level <= levelMax);
    
        const atkMatch =
            (isNaN(atkMin) || atk >= atkMin) &&
            (isNaN(atkMax) || atk <= atkMax);
    
        const defMatch =
            (isNaN(defMin) || def >= defMin) &&
            (isNaN(defMax) || def <= defMax);
    
        // FINAL COMBINATION
        return (
            nameMatch &&
            descMatch &&
            typeMatch &&
            subtypeMatch &&
            monsterBackgroundMatch &&
            mechanicMatch &&
            attributeMatch &&
            limitMatch &&
            levelMatch &&
            atkMatch &&
            defMatch
        );
    });

    currentPage = 1;
    renderPage();
}

searchButton.addEventListener("click", () => {
    applyFilters();
});

document.getElementById("card-name")
    .addEventListener("input", applyFilters);

document.getElementById("card-description")
    .addEventListener("input", applyFilters);


//next page button
nextBtn.addEventListener("click", () => {
    const maxPage = Math.ceil(filteredCards.length / pageSize);         // filteredCards    

    if (currentPage < maxPage) {
        currentPage++;
        renderPage();
    }
});

//previous page button
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
});

// hover on card to display
let cardHoverTimer = null;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;


document.addEventListener("mousemove", e => {

    const distance = Math.sqrt(
        Math.pow(e.clientX - lastMouseX, 2) +
        Math.pow(e.clientY - lastMouseY, 2)
    );

    mouseSpeed = distance;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

});


document.addEventListener("mouseover", (e)=>{

    const card = e.target.closest(".card-ui, .deck-card");

    if(!card) return;


    clearTimeout(cardHoverTimer);


    cardHoverTimer = setTimeout(()=>{


        // ignore cards while mouse is moving fast
        if(mouseSpeed > 20){
            return;
        }


        const name = decodeURIComponent(card.dataset.name ?? "");
        const desc = decodeURIComponent(card.dataset.desc ?? "");
        const img = card.dataset.image ?? "";


        const display = document.getElementById("display-card");
        const display_card_desc = document.getElementById("card-desc");

        display.innerHTML = `
        <img id="card-display-pic" src="${imageCache.get(img)?.src ?? img}" alt="${name}">
        `;


        document.getElementById("card-desc").innerText = desc;
        display_card_desc.style.backgroundColor = "white"


    }, 50);

});

// deck-grid drag and drop

function addCardToDeck(card, deck){

    /*   
    if(!currentUser){
            alert("Login first.");
            return;
        }
    */

    const currentCount = getCardCountInDecks(card.name);
    const limit = Number(card.limit ?? 1);

    if(currentCount >= limit){
        return;
    }
    
    const area = document.getElementById(deck);

    // find first empty slot
    const slots = area.querySelectorAll(".card-slot");

    let emptySlot = null;

    for (let slot of slots){
        if(slot.innerHTML.trim() === ""){
            emptySlot = slot;
            break;
        }
    }

    if(!emptySlot){
        return;
    }

    emptySlot.innerHTML = `
    <div class="deck-card"
         data-id="${card.id ?? getCardIDFromImage(card.image)}"
         data-name="${card.name}"
         data-image="${card.image ?? ""}"
         data-type="${card.cardType}"
         data-subtype="${card.subType}"
         data-background="${card.monsterBackground ?? ""}"
         data-mechanic="${card.monsterMechanic ?? ""}"
         data-attribute="${card.attribute ?? ""}"
         data-level="${card.level ?? ""}"
         data-atk="${card.atk ?? ""}"
         data-def="${card.def ?? ""}"
         data-desc="${encodeURIComponent(card.description ?? "")}"
         data-limit="${card.limit ?? 1}">

         <img src="${imageCache.get(card.image)?.src ?? card.image}" class="deck-card-image">

         ${
            card.limit == 1 
            ? `<div class="limit-badge">1</div>`
            : card.limit == 2
            ? `<div class="limit-badge">2</div>`
            : ""
        }
    </div>
`;
    if(!loadingDeck){
        deckChanged = true;
    }
}

function insertCardIntoSlot(card, targetSlot){

    const grid = targetSlot.closest(
        ".main-deck-grid, .extra-deck-grid, .side-deck-grid"
    );

    const slots = Array.from(
        grid.querySelectorAll(".card-slot")
    );


    const targetIndex = slots.indexOf(targetSlot);


    // collect existing cards
    let cards = Array.from(
        grid.querySelectorAll(".deck-card")
    );


    // if moving an existing card, remove it from its old position
    if(draggedSlot){

        const draggedCard = draggedSlot.querySelector(".deck-card");

        if(draggedCard){

            cards = cards.filter(c => c !== draggedCard);

        }

    }


    // create new card element
    const temp = document.createElement("div");

    temp.innerHTML = `
    <div class="deck-card"
         data-name="${card.name}"
         data-image="${card.image ?? ""}"
         data-type="${card.cardType}"
         data-subtype="${card.subType}"
         data-background="${card.monsterBackground ?? ""}"
         data-mechanic="${card.monsterMechanic ?? ""}"
         data-attribute="${card.attribute ?? ""}"
         data-level="${card.level ?? ""}"
         data-atk="${card.atk ?? ""}"
         data-def="${card.def ?? ""}"
         data-desc="${encodeURIComponent(card.description ?? "")}"
         data-limit="${card.limit ?? 1}">

         <img src="${imageCache.get(card.image)?.src ?? card.image}" class="deck-card-image">
         ${
            card.limit == 1 
            ? `<div class="limit-badge">1</div>`
            : card.limit == 2
            ? `<div class="limit-badge">2</div>`
            : ""
        }
    </div>
    `;


    const newCard = temp.firstElementChild;


    // insert at exact position
    cards.splice(targetIndex, 0, newCard);


    // clear grid
    slots.forEach(slot=>{
        slot.innerHTML = "";
    });


    // refill slots
    cards.forEach((cardElement,index)=>{

        if(slots[index]){

            slots[index].appendChild(cardElement);

        }

    });


    draggedSlot = null;

    deckChanged = true;

}

const decks = document.querySelectorAll(".deck-grid");


decks.forEach(deck => {

    deck.addEventListener("dragover", e=>{
        e.preventDefault();
    });

    deck.addEventListener("drop", e=>{



        console.log("DROP FIRED ON:", deck.id);

        e.preventDefault();

        const targetSlot = e.target.closest(".card-slot");

if (targetSlot === draggedSlot) {
    return;
}

        const card = JSON.parse(
            e.dataTransfer.getData("card")
        );

        const destination = deck.id;

        console.log(card);
        console.log(card.monsterBackground);

        // Fusion / xyz restriction
        if(
            destination === "main-deck-grid" &&
            (card.monsterBackground === "fusion" || card.monsterBackground === "xyz")
        ){
            return;
        }

        // normal monster restriction
        if(
            destination === "extra-deck-grid" &&
            (card.monsterBackground !== "fusion" && card.monsterBackground !== "xyz")
        ){
            return;
        }
        const moving = e.dataTransfer.getData("moving");


        // If moving an existing card, remove the old one first
        if(moving === "true"){
        
            if(draggedSlot){
        
                draggedSlot.innerHTML = "";
        
            }
        
        }
        
        // Now check limit after removal
        const currentCount = getCardCountInDecks(card.name);
        
        if(currentCount >= Number(card.limit)){
            return;
        }

        // Add card to new location


        if(!targetSlot){
            return;
        }

        insertCardIntoSlot(card, targetSlot);

        });
});


document.addEventListener("contextmenu", e => {

    const card = e.target.closest(".deck-card");

    if(!card) return;

    e.preventDefault();


    const deckGrid = card.closest(
        ".main-deck-grid, .extra-deck-grid, .side-deck-grid"
    );


    // remove the card
    card.parentElement.innerHTML = "";
    deckChanged = true;


    // get all remaining cards
    const cards = Array.from(
        deckGrid.querySelectorAll(".deck-card")
    );


    // get all slots
    const slots = deckGrid.querySelectorAll(".card-slot");


    // clear slots
    slots.forEach(slot => {
        slot.innerHTML = "";
    });


    // refill slots in order
    cards.forEach((card, index)=>{

        if(slots[index]){

            slots[index].appendChild(card);

        }

    });

});


loadCards();

function findCardByID(id){

    return allCards.find(card => {

        const filename = card.image
            .split("/")
            .pop()
            .replace(".jpg","");

        return filename === String(id);

    });

}

