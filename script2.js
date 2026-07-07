// firebase set up
import { getFirestore, collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyG0Sv22MpAL8z4GC8CYj5z0U0oCqB4bqc",
    authDomain: "equilibreo.firebaseapp.com",
    projectId: "equilibreo",
    storageBucket: "equilibreo.firebasestorage.app",
    messagingSenderId: "661319732393",
    appId: "1:661319732393:web:5ebd35db44e1bc8d87adb8",
    measurementId: "G-15E529WTLQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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

const monsterSubtypes = [ "", "aqua", "beast", "dinosaur", "dragon",
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
const newDeckBtn = document.getElementById("new-deck");
const deleteDeckBtn = document.getElementById("delete");

newDeckBtn.addEventListener("click", function () {

    const deckName = prompt("Enter deck name:");

    if (!deckName) return; // cancel or empty

    const option = document.createElement("option");
    option.value = deckName;
    option.textContent = deckName;

    selectDeck.appendChild(option);

    selectDeck.value = deckName;
});

deleteDeckBtn.addEventListener("click", function () {

    const selectedDeck = selectDeck.value;

    if (!selectedDeck) return;

    const confirmDelete = confirm("Are you sure you want to delete this deck?");

    if (!confirmDelete) return;

    const options = selectDeck.options;

    for (let i = 0; i < options.length; i++) {
        if (options[i].value === selectedDeck) {
            selectDeck.remove(i);
            break;
        }
    }

    selectDeck.value = "";
});

// online search
let searchResults = [];
let allCards = [];
let filteredCards = [];

let currentPage = 1;
const pageSize = 20;

const nextBtn = document.getElementById("next-page");
const prevBtn = document.getElementById("prev-page");

const searchButton = document.getElementById("search-button");

function updatePageButtons() {
    const maxPage = Math.ceil(filteredCards.length / pageSize);     // fileteredCards

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= maxPage;
}

// render page function
function renderPage() {

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const pageItems = filteredCards.slice(start, end);

    const slots = document.querySelectorAll(".search-grid .card-slot");

    slots.forEach(slot => slot.innerHTML = "");

    pageItems.forEach((card, index) => {

        if (!slots[index]) return;

        slots[index].innerHTML = `
            <div class="card-ui" draggable="true"
                 data-name="${card.name}"
                 data-image="${card.image ?? ""}"
                 data-type="${card.cardType}"
                 data-subtype="${card.subType}"
                 data-background="${card.monsterBackground ?? ""}"
                 data-attribute="${card.attribute ?? ""}"
                 data-level="${card.level ?? ""}"
                 data-atk="${card.atk ?? ""}"
                 data-def="${card.def ?? ""}"
                 data-desc="${card.description ?? ""}"
                 data-limit="${card.limit ?? 1}">

                 ${card.limit < 3 ? `
                    <div class="limit-badge">
                        ${card.limit}
                    </div>
                 ` : ""}

                <img class="card-pic" src="${card.image}" alt="${card.name}">

                <div class="card-text">
                    <strong>${card.name}</strong><br>

                    ${card.cardType === "monster" ? `                
                        Level: ${card.level ?? "-"}<br>
                        Attribute: ${card.attribute ?? "-"}<br>
                        ATK: ${card.atk ?? "-"} / DEF: ${card.def ?? "-"}<br>
                    ` : ""}

                    <em>${card.subType}</em>
                </div>

                ${card.description ? `
                    <div class="card-desc">
                        ${card.description}
                    </div>
                ` : ""}

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
        description: cardUI.dataset.desc,
        monsterBackground: cardUI.dataset.background,
        limit: cardUI.dataset.limit
    };


    // Fusion goes extra deck
    if(card.monsterBackground === "fusion"){
        addCardToDeck(card, "extra-deck-grid");
    }
    else{
        addCardToDeck(card, "main-deck-grid");
    }

});

async function loadCards() {

    const cardsSnapshot = await getDocs(collection(db, "cards"));

    searchResults = [];

    cardsSnapshot.forEach((doc) => {

        searchResults.push({
            id: doc.id,
            ...doc.data()
        });

    });

    allCards = [...searchResults];
    filteredCards = [...allCards];

    console.log("Firebase cards:", searchResults);

    renderPage();
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
        description: card.dataset.desc,
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
                 data-desc="${card.description ?? ""}"
                 data-limit="${card.limit ?? 1}">
                 <img src="${card.image}" class="deck-card-image">
                </div>
            `;
            break;
        }
    }

}

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

const sideDeck = document.getElementById("side-deck-grid");
    sideDeck.addEventListener("dragover", e=>{
        e.preventDefault();
    });
    sideDeck.addEventListener("drop", e=>{

        e.preventDefault();
        const card = JSON.parse(
            e.dataTransfer.getData("card")
        );
        addCardToSideDeck(card);
});



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
document.addEventListener("mouseover", (e)=>{

    const card = e.target.closest(".card-ui, .deck-card");

    if(!card) return;


    const name = card.dataset.name ?? "";
    const desc = card.dataset.desc ?? "";
    const img = card.dataset.image ?? "";


    const display = document.getElementById("display-card");

    display.innerHTML = `
        <img id="card-display-pic" src="${img}" alt="${name}">
    `;


    document.getElementById("card-desc").innerText = desc;

});

// deck-grid drag and drop

function addCardToDeck(card, deck){

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
         data-desc="${card.description ?? ""}"
         data-limit="${card.limit ?? 1}">

        <img src="${card.image}" class="deck-card-image">

    </div>
`;
}

const decks = document.querySelectorAll(".deck-grid");


decks.forEach(deck => {

    deck.addEventListener("dragover", e=>{
        e.preventDefault();
    });

    deck.addEventListener("drop", e=>{

        console.log("DROP FIRED ON:", deck.id);

        e.preventDefault();

        const card = JSON.parse(
            e.dataTransfer.getData("card")
        );

        const destination = deck.id;

        // Fusion restriction
        if(
            destination === "main-deck-grid" &&
            card.background === "fusion"
        ){
            return;
        }

        // normal monster restriction
        if(
            destination === "extra-deck-grid" &&
            card.background !== "fusion"
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
        addCardToDeck(card,destination);
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