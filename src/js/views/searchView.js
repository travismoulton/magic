import { elements } from "./base";

// ******************************* \\
// ********** TYPE LINE ********** \\
// ******************************* \\

export const showTypesDropDown = () => {
  if (elements.apiSearch.typeDropDown.hasAttribute("hidden")) {
    elements.apiSearch.typeDropDown.removeAttribute("hidden");
    elements.apiSearch.typeDropDown.scrollTop = 0;
    console.log("types dropdown");

    // Make sure to display all types when opening the dropdown and before taking input
    filterTypes("");
    filterSelectedTypes();
    filterTypeHeaders();
  }
};

export const hideTypesDropDown = () => {
  if (!elements.apiSearch.typeDropDown.hasAttribute("hidden")) {
    elements.apiSearch.typeLine.value = "";
    elements.apiSearch.typeDropDown.setAttribute("hidden", "true");
    document.removeEventListener("keydown", navigateTypesDropDown);
  }
};

export const filterTypeHeaders = () => {
  // On every input into the typeline bar, make all headers visible
  const headers = Array.from(
    document.querySelectorAll(".js--types-category-header")
  );
  headers.forEach((header) => {
    if (header.hasAttribute("hidden")) header.removeAttribute("hidden");
  });

  // For each category of type, if there are not any visible because they were filtered out
  // hide the header for that category
  if (!document.querySelector(".js--basic:not([hidden])")) {
    document.querySelector(".js--basic-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--super:not([hidden])")) {
    document.querySelector(".js--super-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--artifact:not([hidden])")) {
    document
      .querySelector(".js--artifact-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--enchantment:not([hidden])")) {
    document
      .querySelector(".js--enchantment-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--land:not([hidden])")) {
    document.querySelector(".js--land-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--spell:not([hidden])")) {
    document.querySelector(".js--spell-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--planeswalker:not([hidden])")) {
    document
      .querySelector(".js--planeswalker-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--creature:not([hidden])")) {
    document
      .querySelector(".js--creature-header")
      .setAttribute("hidden", "true");
  }
};

export const filterSelectedTypes = () => {
  const types = Array.from(
    document.querySelectorAll("[data-type][data-selected]")
  );

  types.forEach((type) => {
    if (type.getAttribute("data-selected") === "true") {
      if (!type.hasAttribute("hidden")) type.setAttribute("hidden", "true");
    }
  });
};

export const filterTypes = (str) => {
  const types = Array.from(document.querySelectorAll("[data-type]"));

  // Remove the hidden attribute if it exists on any element, and then hide any elements
  // that don't include the string given in the input from the user
  types.forEach((type) => {
    if (type.hasAttribute("hidden")) type.removeAttribute("hidden");
    if (
      !type.getAttribute("data-type").toLowerCase().includes(str.toLowerCase())
    ) {
      type.setAttribute("hidden", "true");
    }
  });

  filterSelectedTypes();
};

export const highlightType = (type) => {
  if (document.querySelector(".js--highlighted")) removeCurrentHighlight();

  if (type) {
    type.classList.add(
      "js--highlighted",
      "search-form__dropdown-list-option--highlighted"
    );
  }
};

export const removeCurrentHighlight = () => {
  document
    .querySelector(".js--highlighted")
    .classList.remove(
      "js--highlighted",
      "search-form__dropdown-list-option--highlighted"
    );
};

export const setScrollTopOnDownArrow = (el, dropdown) => {
  if (
    el.offsetTop > dropdown.offsetHeight - el.offsetHeight &&
    dropdown.scrollTop + dropdown.offsetHeight - el.offsetHeight < el.offsetTop
  ) {
    dropdown.scrollTop = el.offsetTop - dropdown.offsetHeight + el.offsetHeight;
  }
};

export const setScrollTopOnUpArrow = (el, dropdown) => {
  if (el.offsetTop < dropdown.scrollTop) {
    dropdown.scrollTop = el.offsetTop;

    // 30 is the height of category headers. If the category header is
    // the only element left that is not revealed, set teh scroll top to 0
    if (dropdown.scrollTop <= 30) dropdown.scrollTop = 0;
  }
};

export const navigateTypesDropDown = (e) => {
  const types = Array.from(
    document.querySelectorAll(".js--type:not([hidden])")
  );
  const i = types.indexOf(document.querySelector(".js--highlighted"));

  if (e.code === "ArrowDown" && i < types.length - 1) {
    e.preventDefault();
    removeCurrentHighlight();
    highlightType(types[i + 1]);

    setScrollTopOnDownArrow(types[i + 1], elements.apiSearch.typeDropDown);
  }

  if (e.code === "ArrowUp") {
    e.preventDefault();

    // We always want to prevent the default. We only want to change the
    // highlight if not on the top type in the dropdown
    if (i > 0) {
      removeCurrentHighlight();
      highlightType(types[i - 1]);

      setScrollTopOnUpArrow(types[i - 1], elements.apiSearch.typeDropDown);
    }
  }

  if (e.code === "Enter") {
    e.preventDefault();

    toggleDataSelected(document.querySelector(".js--highlighted"));
    addType(
      document.querySelector(".js--highlighted").getAttribute("data-type")
    );
    hideTypesDropDown();
  }
};

export const hoverOverTypesListener = () => {
  const types = Array.from(
    document.querySelectorAll(".js--type:not([hidden])")
  );

  types.forEach((type) => {
    type.addEventListener("mouseenter", () => highlightType(type));
  });
};

export const startTypesDropDownNavigation = () => {
  document.removeEventListener("keydown", navigateTypesDropDown);
  const firstType = document.querySelector(".js--type:not([hidden])");
  highlightType(firstType);
  hoverOverTypesListener();
  document.addEventListener("keydown", navigateTypesDropDown);
  elements.apiSearch.typeDropDown.scrollTop = 0;
};

const removeTypeBtn = () => {
  // Span will act as the button to remove types from the "selected" list
  const btn = document.createElement("span");
  btn.classList =
    "search-form__selected-types-remove-btn js--api-types-close-btn";
  btn.innerHTML = "x";

  btn.onclick = () => {
    const typeName = btn.nextElementSibling.nextElementSibling.innerHTML;

    const typeToToggle = document.querySelector(`[data-type|=${typeName}]`);

    toggleDataSelected(typeToToggle);

    btn.parentElement.parentElement.removeChild(btn.parentElement);
  };

  return btn;
};

const typeToggleBtn = () => {
  // Span will act as the button to toggle whether or not a type is included or excluded from the search
  const btn = document.createElement("span");
  btn.classList =
    "search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler";
  btn.innerHTML = "IS";

  /*
        This will toggle between searching for cards that include the given type and exclude the given type.
        It will make sure that the appropriate data type is given to the span element that contains the type
        So that the search functionality creates the appropriate query string

    */
  btn.onclick = () => {
    if (btn.innerHTML === "IS") {
      btn.classList =
        "search-form__selected-types-toggler search-form__selected-types-toggler--not js--api-types-toggler";
      btn.nextElementSibling.removeAttribute("data-include-type");
      btn.nextElementSibling.setAttribute(
        "data-exclude-type",
        btn.nextElementSibling.innerHTML
      );
      btn.innerHTML = "NOT";
    } else {
      btn.classList =
        "search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler";
      btn.nextElementSibling.removeAttribute("data-exclude-type");
      btn.nextElementSibling.setAttribute(
        "data-include-type",
        btn.nextElementSibling.innerHTML
      );
      btn.innerHTML = "IS";
    }
  };

  return btn;
};

export const toggleDataSelected = (typeOrSet) => {
  if (typeOrSet.getAttribute("data-selected") === "true") {
    typeOrSet.setAttribute("data-selected", "false");
  } else {
    typeOrSet.setAttribute("data-selected", "true");
  }
};

const addType = (type) => {
  // Create the empty li element to hold the types that the user selects. Set the class list,
  // and the data-selected attribute to true.
  const li = document.createElement("li");
  li.classList = "search-form__selected-types-list-item js--api-selected-type";

  // The typeSpan holds the type selected by the user from the dropdown. The data attribute
  // is used in Search.js to build the query string
  const typeSpan = document.createElement("span");
  typeSpan.setAttribute("data-include-type", type);
  typeSpan.innerHTML = type;

  // Construct the li element. The removeTypeBtn and typeToggleBtn funcitons return html elements
  li.appendChild(removeTypeBtn());
  li.appendChild(typeToggleBtn());
  li.appendChild(typeSpan);

  elements.apiSearch.selectedTypes.appendChild(li);
};

export const typeLineListener = (e) => {
  // If the target is not Type Line input line, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== elements.apiSearch.typeLine &&
    !e.target.matches(".js--api-dropdown-types-list")
  ) {
    hideTypesDropDown();
    document.removeEventListener("click", typeLineListener);
    // If the target is one if types, get the data type
  } else if (e.target.hasAttribute("data-type")) {
    toggleDataSelected(e.target);
    addType(e.target.getAttribute("data-type"));
    elements.apiSearch.typeLine.focus();
    hideTypesDropDown();
  }
};

// ******************************* \\
// ************* SETS ************ \\
// ******************************* \\

export const showSetsDropDown = () => {
  if (elements.apiSearch.setDropDown.hasAttribute("hidden")) {
    elements.apiSearch.setDropDown.removeAttribute("hidden");
    elements.apiSearch.setDropDown.scrollTop = 0;

    filterSets("");
    filterSelectedSets();
    filterSetHeaders();
  }
};

export const hideSetsDropDown = () => {
  if (!elements.apiSearch.setDropDown.hasAttribute("hidden")) {
    elements.apiSearch.setDropDown.setAttribute("hidden", "true");
    elements.apiSearch.setInput.value = "";
    document.removeEventListener("keydown", navigateSetsDropDown);
  }
};

export const filterSetHeaders = () => {
  // On every input into the typeline bar, make all headers visible
  const headers = Array.from(
    document.querySelectorAll(".js--sets-category-header")
  );
  headers.forEach((header) => {
    if (header.hasAttribute("hidden")) header.removeAttribute("hidden");
  });

  // For each category of type, if there are not any visible because they were filtered out
  // hide the header for that category
  if (!document.querySelector(".js--expansion:not([hidden])")) {
    document
      .querySelector(".js--expansion-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--core:not([hidden])")) {
    document.querySelector(".js--core-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--masters:not([hidden])")) {
    document
      .querySelector(".js--masters-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--draft:not([hidden])")) {
    document.querySelector(".js--draft-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--duel_deck:not([hidden])")) {
    document
      .querySelector(".js--duel_deck-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--archenemy:not([hidden])")) {
    document
      .querySelector(".js--archenemy-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--box:not([hidden])")) {
    document.querySelector(".js--box-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--commander:not([hidden])")) {
    document
      .querySelector(".js--commander-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--vault:not([hidden])")) {
    document.querySelector(".js--vault-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--funny:not([hidden])")) {
    document.querySelector(".js--funny-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--masterpiece:not([hidden])")) {
    document
      .querySelector(".js--masterpiece-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--memorabilia:not([hidden])")) {
    document
      .querySelector(".js--memorabilia-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--planechase:not([hidden])")) {
    document
      .querySelector(".js--planechase-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--premium_deck:not([hidden])")) {
    document
      .querySelector(".js--premium_deck-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--promo:not([hidden])")) {
    document.querySelector(".js--promo-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--spellbook:not([hidden])")) {
    document
      .querySelector(".js--spellbook-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--starter:not([hidden])")) {
    document
      .querySelector(".js--starter-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--token:not([hidden])")) {
    document.querySelector(".js--token-header").setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--treasure_chest:not([hidden])")) {
    document
      .querySelector(".js--treasure_chest-header")
      .setAttribute("hidden", "true");
  }

  if (!document.querySelector(".js--vanguard:not([hidden])")) {
    document
      .querySelector(".js--vanguard-header")
      .setAttribute("hidden", "true");
  }
};

export const filterSets = (str) => {
  // get all of the sets out of the dropdown list
  const sets = Array.from(document.querySelectorAll("[data-set-name]"));

  // Remove the hidden attribute if it exists on any element, and then hide any elements
  // that don't include the string given in the input from the user
  sets.forEach((s) => {
    if (s.hasAttribute("hidden")) s.removeAttribute("hidden");

    filterSelectedSets();

    if (
      !s
        .getAttribute("data-set-name")
        .toLowerCase()
        .includes(str.toLowerCase()) &&
      !s.getAttribute("data-set-code").toLowerCase().includes(str.toLowerCase())
    ) {
      s.setAttribute("hidden", "true");
    }
  });
};

export const filterSelectedSets = () => {
  const sets = Array.from(
    document.querySelectorAll("[data-set-name][data-selected]")
  );

  sets.forEach((s) => {
    if (s.getAttribute("data-selected") === "true") {
      if (!s.hasAttribute("hidden")) s.setAttribute("hidden", "true");
    }
  });
};

export const highlightSet = (sett) => {
  if (document.querySelector(".js--highlighted")) removeCurrentHighlight();

  if (sett) {
    sett.classList.add(
      "js--highlighted",
      "search-form__dropdown-list-option--highlighted"
    );
  }
};

export const navigateSetsDropDown = (e) => {
  const sets = Array.from(document.querySelectorAll(".js--set:not([hidden])"));
  const i = sets.indexOf(document.querySelector(".js--highlighted"));

  if (e.code === "ArrowDown" && i < sets.length - 1) {
    e.preventDefault();
    removeCurrentHighlight();
    highlightSet(sets[i + 1]);

    setScrollTopOnDownArrow(sets[i + 1], elements.apiSearch.setDropDown);
  }

  if (e.code === "ArrowUp" && i > 0) {
    e.preventDefault();
    removeCurrentHighlight();
    highlightSet(sets[i - 1]);

    setScrollTopOnUpArrow(sets[i - 1], elements.apiSearch.setDropDown);
  }

  if (e.code === "Enter") {
    e.preventDefault();

    toggleDataSelected(document.querySelector(".js--highlighted"));
    addSet(
      document.querySelector(".js--highlighted").getAttribute("data-set-name"),
      document.querySelector(".js--highlighted").getAttribute("data-set-code")
    );
    hideSetsDropDown();
  }
};

export const hoverOverSetsListener = () => {
  const sets = Array.from(document.querySelectorAll(".js--set:not([hidden])"));

  sets.forEach((s) => {
    s.addEventListener("mouseenter", () => highlightType(s));
  });
};

export const startSetsDropDownNavigation = () => {
  const firstSet = document.querySelector(".js--set:not([hidden])");
  highlightSet(firstSet);
  hoverOverSetsListener();
  document.addEventListener("keydown", navigateSetsDropDown);
  elements.apiSearch.setDropDown.scrollTop = 0;
};

const removeSetBtn = () => {
  // Span will act as the button to remove sets from the "selected" list
  const btn = document.createElement("span");
  btn.classList =
    "search-form__selected-sets-remove-btn js--api-sets-close-btn";
  btn.innerHTML = "x";

  btn.onclick = () => {
    const setName = btn.nextElementSibling.innerHTML;
    const setToToggle = document.querySelector(`[data-set-name|=${setName}]`);
    toggleDataSelected(setToToggle);

    btn.parentElement.parentElement.removeChild(btn.parentElement);
  };

  return btn;
};

const addSet = (setName, setCode) => {
  // Create the empty li element to hold the types that the user selects. Set the class list,
  // and the data-selected attribute to true.
  const li = document.createElement("li");
  li.classList = "search-form__selected-sets-list-item js--api-selected-set";

  // The typeSpan holds the type selected by the user from the dropdown. The data attribute
  // is used in Search.js to build the query string
  const setSpan = document.createElement("span");
  setSpan.setAttribute("data-include-set", setCode);
  setSpan.innerHTML = setName;

  li.appendChild(removeSetBtn());
  li.appendChild(setSpan);

  elements.apiSearch.selectedSets.appendChild(li);
};

export const setInputListener = (e) => {
  // If the target is not the set input field, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== elements.apiSearch.setInput &&
    !e.target.matches(".js--api-dropdown-sets-list")
  ) {
    hideSetsDropDown();
    document.removeEventListener("click", setInputListener);
    // If the target is one of the set options, toggle it as selected, add it to the list,
    // and hide the dropdown.
  } else if (e.target.hasAttribute("data-set-name")) {
    toggleDataSelected(e.target);
    addSet(
      e.target.getAttribute("data-set-name"),
      e.target.getAttribute("data-set-code")
    );
    elements.apiSearch.setInput.focus();
    hideSetsDropDown();
  }
};

// ******************************* \\
// ************ STATS ************ \\
// ******************************* \\

export const statLineController = () => {
  if (checkStatLineForInteger() && checkForLessThanFourStatLines()) {
    const clone = createStatsClone();
    editStatsClone(clone);
    insertStatsClone(clone);
    resetStatLineEventListener();
  }
};

const checkStatLineForInteger = () => {
  const statVal = Array.from(
    document.querySelectorAll(".js--api-stat-value")
  ).slice(-1)[0];

  return parseInt(statVal.value) >= 0 ? true : false;
};

const checkForLessThanFourStatLines = () => {
  const stats = Array.from(document.querySelectorAll(".js--api-stat-value"));

  return stats.length < 4 ? true : false;
};

const createStatsClone = () => {
  return document.querySelector(".js--api-stats-wrapper").cloneNode(true);
};

const editStatsClone = (clone) => {
  clone.querySelector(".js--api-stat").value = "";
  clone.querySelector(".js--api-stat-filter").value = "";
  clone.querySelector(".js--api-stat-value").value = "";
};

const insertStatsClone = (clone) => {
  const lastStatLine = Array.from(
    document.querySelectorAll(".js--api-stats-wrapper")
  ).slice(-1)[0];

  lastStatLine.insertAdjacentElement("afterend", clone);
};

const resetStatLineEventListener = () => {
  const statValues = Array.from(
    document.querySelectorAll(".js--api-stat-value")
  );
  statValues.slice(-2)[0].removeEventListener("input", statLineController);
  statValues.slice(-1)[0].addEventListener("input", statLineController);
};

// ******************************* \\
// ********* LEGAL STATUS ******** \\
// ******************************* \\

export const formatLineController = () => {
  console.log(checkForFourLessThanFormatLines());
  if (checkForFourLessThanFormatLines() && checkFormatLineForValue()) {
    const clone = createFormatClone();
    editFormatClone(clone);
    insertFormatClone(clone);
    resetFormatLineEventListener();
  }
};

const checkFormatLineForValue = () => {
  const format = Array.from(document.querySelectorAll(".js--api-format")).slice(
    -1
  )[0];

  return format.value !== "" ? true : false;
};

const checkForFourLessThanFormatLines = () => {
  const formats = Array.from(document.querySelectorAll(".js--api-format"));
  return formats.length < 4 ? true : false;
};

const createFormatClone = () => {
  return document.querySelector(".js--api-format-wrapper").cloneNode(true);
};

const editFormatClone = (clone) => {
  clone.querySelector(".js--api-legal-status").value = "";
  clone.querySelector(".js--api-format").value = "";
};

const insertFormatClone = (clone) => {
  const lastFormatLine = Array.from(
    document.querySelectorAll(".js--api-format-wrapper")
  ).slice(-1)[0];

  lastFormatLine.insertAdjacentElement("afterend", clone);
};

const resetFormatLineEventListener = () => {
  const formats = Array.from(document.querySelectorAll(".js--api-format"));
  formats.slice(-2)[0].removeEventListener("change", formatLineController);
  formats.slice(-1)[0].addEventListener("change", formatLineController);
};
