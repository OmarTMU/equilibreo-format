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
    monsterBackground,
    cardSubtype, // s/t
    monsterMechanic,
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

// SEARCH 

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


// search results
const searchResults = [
    {
        name: "Blue-Eyes White Dragon",
        cardType: "monster",
        monsterBackground: "normal",
        subtype: "dragon",
        attribute: "light",
        level: 8,
        atk: 3000,
        def: 2500,
        description: "",
        image: "card-pics/blue-eyes.jpg"
    },
    {
        name: "Dark Magician",
        cardType: "monster",
        monsterBackground: "normal",
        subtype: "spellcaster",
        attribute: "dark",
        level: 7,
        atk: 2500,
        def: 2100,
        description: "daisdhsai dhasidh dsgadgsaydasgdusagduiasgd agsdi ausdgaiu dgauid gaui dgauis dgauis dgaiu dgaiu dgiua sdg iaudgaiusd guais dgaisu dgiaus dgiuasd gis adgai dgsaiud gsiudfgdsiuf gdsiufgsiduf saidha sdhais dhais dhasi dahis dhasi dhsai dhsaoi dshad sahdo sadhosa dhaso idaho dahod",
        image: "card-pics/dark-magician.jpg"
    },
    {
        name: "Jinzo",
        cardType: "monster",
        monsterBackground: "effect",
        subtype: "machine",
        attribute: "dark",
        level: 6,
        atk: 2400,
        def: 1500,
        description: "Trap Cards and their effects on the field are negated."
    },
    {
        name: "Cyber Dragon",
        cardType: "monster",
        monsterBackground: "effect",
        subtype: "machine",
        attribute: "light",
        level: 5,
        atk: 2100,
        def: 1600,
        description: "Can Special Summon itself if opponent controls a monster and you control none."
    },
    {
        name: "Harpie Lady",
        cardType: "monster",
        monsterBackground: "effect",
        subtype: "winged-beast",
        attribute: "wind",
        level: 4,
        atk: 1300,
        def: 1400,
        description: ""
    },
    {
        name: "Mystical Space Typhoon",
        cardType: "spell",
        monsterBackground: null,
        subtype: "quick-play",
        attribute: null,
        level: null,
        atk: null,
        def: null,
        description: "Target 1 Spell/Trap; destroy that target."
    },
    {
        name: "Mirror Force",
        cardType: "trap",
        monsterBackground: null,
        subtype: "normal",
        attribute: null,
        level: null,
        atk: null,
        def: null,
        description: "When an opponent's monster declares an attack: destroy all Attack Position monsters your opponent controls."
    }
];

const searchButton = document.getElementById("search-button");

function applyFilters() {

    filteredCards = allCards.filter(card => {

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
        const mechanicMatch = monsterMechanic === "" || card.mechanic === monsterMechanic;
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


let currentPage = 1; // UI starts at 1
const pageSize = 20;
const allCards = [...searchResults]; // original database
let filteredCards = [...searchResults];

// let searchResults = [];

const nextBtn = document.getElementById("next-page");
const prevBtn = document.getElementById("prev-page");

function updatePageButtons() {
    const maxPage = Math.ceil(filteredCards.length / pageSize);

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
//next page button
nextBtn.addEventListener("click", () => {
    const maxPage = Math.ceil(filteredCards.length / pageSize);

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