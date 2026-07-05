const cardType = document.getElementById("card-type");

const monsterType = document.getElementById("monster-type");
const monsterSubtype = document.getElementById("monster-subtype");
const monsterMechanic = document.getElementById("monster-mechanic");

function monster_check() {
    if (cardType.value === "monster") {
        monsterType.disabled = false;
        monsterSubtype.disabled = false;
        monsterMechanic.disabled = false;
    } else {
        monsterType.disabled = true;
        monsterType.value = "";
        monsterSubtype.disabled = true;
        monsterSubtype.value = "";
        monsterMechanic.disabled = true;
        monsterMechanic.value = "";
    }
}
cardType.addEventListener("change", monster_check);