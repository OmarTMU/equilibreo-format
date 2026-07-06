const cardType = document.getElementById("card-type");

const monsterType = document.getElementById("monster-type");
const cardSubtype = document.getElementById("card-subtype");
const monsterMechanic = document.getElementById("monster-mechanic");

const attributeSelect = document.getElementById("attribute-select");

const levelMin = document.getElementById("level-min");
const levelMax = document.getElementById("level-max");

const atkMin = document.getElementById("atk-min");
const atkMax = document.getElementById("atk-max");

const defMin = document.getElementById("def-min");
const defMax = document.getElementById("def-max");

const limitSelect = document.getElementById("limit-select");

const monsterSubtypes = ["", "warrior", "spellcaster",
    "dragon", "fiend", "machine", "beast", "zombie", "fairy",
    "aqua", "pyro", "rock", "winged-beast", "insect", "reptile",
    "sea-serpent", "thunder", "dinosaur", "fish", "psychic", "wyrm"
];
const spellSubtypes = ["", "normal", "continuous", "quick-play", "field", "equip", "ritual"];
const trapSubtypes = ["", "normal", "continuous", "counter"];

const filterList = [
    monsterType,
    cardSubtype, // s/t
    monsterMechanic,
    attributeSelect,
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

//search
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", function () {
    console.log("Search clicked");
});


// search-live as user types name/desc
const cardName = document.getElementById("card-name");
const cardDescription = document.getElementById("card-description");

function searchCards() {
    console.log(cardName.value);
    console.log(cardDescription.value);

    // Search your Firebase/database here
}

cardName.addEventListener("input", searchCards);
cardDescription.addEventListener("input", searchCards);


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

