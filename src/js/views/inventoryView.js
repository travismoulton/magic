import { generateManaCostImages } from "./resultsView";
import { checkListHoverEvents } from "./resultsView";

const shortenTypeLine = () => {
  const types = Array.from(document.querySelectorAll(".js--inv-types"));
  types.forEach((type) => {
    let html = type.innerHTML;

    // if the — delimiter is found in the string, return everything before the delimiter
    if (html.indexOf("—") !== -1) {
      type.innerHTML = html.substring(0, html.indexOf("—") - 1);
    }
  });
};

const alterManaImages = () => {
  const manaCosts = Array.from(document.querySelectorAll(".js--inv-mana-cost"));

  manaCosts.forEach((cost) => {
    cost.innerHTML = generateManaCostImages(cost.innerHTML);
  });
};

// Not using this right now *************************************
const sortTableAlphabetically = () => {
  let rows = Array.from(document.querySelectorAll(".js--checklist-row"));
  const table = document.querySelector(".js--card-checklist");
  let cards = [];

  rows.forEach((row) => {
    cards.push(row.querySelector(".js--checklist-card-name").innerHTML);
    row.parentElement.removeChild(row);
  });

  cards = cards.sort();

  for (let i = 0; i < cards.length; i++) {
    const rowIndex = rows.indexOf(
      rows.find((row) => row.getAttribute("data-row") === cards[i])
    );

    table.insertAdjacentElement("beforeend", rows[rowIndex]);

    rows.splice(rowIndex, 1);
  }
};

const giveEarningsColumnModifier = () => {
  const rows = Array.from(document.querySelectorAll(".js--inv-earnings"));

  rows.forEach((row) => {
    if (row.innerHTML.startsWith("-")) {
      row.classList.add("negative-earnings");
    } else if (row.innerHTML === "0.0") {
      row.classList.add("no-earnings");
    } else {
      row.classList.add("positive-earnings");
    }
  });
};

const removeHashTagFromRarity = () => {
  const raritys = Array.from(document.querySelectorAll(".js--rarity"));
  raritys.forEach((r) => (r.innerHTML = r.innerHTML.substring(1)));
};

export const alterInventoryTable = () => {
  shortenTypeLine();
  alterManaImages();
  checkListHoverEvents();
  giveEarningsColumnModifier();
  removeHashTagFromRarity();
};
