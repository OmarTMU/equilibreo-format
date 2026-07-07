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

    const pageItems = filteredCards.slice(start, end);      // filteredCards

    const slots = document.querySelectorAll(".search-grid .card-slot");

    slots.forEach(slot => slot.innerHTML = "");

    pageItems.forEach((card, index) => {

        if (!slots[index]) return;

        slots[index].innerHTML = `
            <div class="card-ui"
                 data-name="${card.name}"
                 data-image="${card.image ?? ""}"
                 data-type="${card.cardType}"
                 data-subtype="${card.subtype}"
                 data-attribute="${card.attribute ?? ""}"
                 data-level="${card.level ?? ""}"
                 data-atk="${card.atk ?? ""}"
                 data-def="${card.def ?? ""}"
                 data-desc="${card.description ?? ""}">

                <img class="card-pic" src="${card.image}" alt="${card.name}">

                <div class="card-text">
                    <strong>${card.name}</strong><br>

                    ${card.cardType === "monster" ? `                
                        Level: ${card.level ?? "-"}<br>
                        Attribute: ${card.attribute ?? "-"}<br>
                        ATK: ${card.atk ?? "-"} / DEF: ${card.def ?? "-"}<br>
                    ` : ""}

                    <em>${card.subtype}</em>
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
        const subtypeMatch = cardSubtype === "" || card.subtype === cardSubtype;
        const monsterBackgroundMatch = monsterBackground === "" || card.monsterBackground === monsterBackground;
        const mechanicMatch = monsterMechanic === "" || card.monsterMechanic === monsterMechanic;
        const attributeMatch = attribute === "" || card.attribute === attribute;
        const limitMatch = limitSelect === "" || card.limit === limitSelect;
    
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
document.addEventListener("mouseover", (e) => {

    const slot = e.target.closest(".card-slot");
    if (!slot) return;

    const cardUI = slot.querySelector(".card-ui");
    if (!cardUI) return;

    const name = cardUI.querySelector("strong")?.innerText ?? "";
    const desc = cardUI.querySelector(".card-desc")?.innerText ?? "";
    const img = cardUI.dataset.image ?? "";

    // IMAGE
    const display = document.getElementById("display-card");

    display.innerHTML = `
        <img id="card-display-pic" src="${img}" alt="${name}">
    `;

    // DESCRIPTION
    document.getElementById("card-desc").innerText = desc;
});

loadCards();