import axios from 'axios';
import { elements } from '../views/base';

function searchByName(search) {
    const cardName = elements.apiSearch.cardName.value;
    if (cardName) search += cardName;
    return search;
  }  
  
function searchByOtext(search) {
    const oracleText = elements.apiSearch.oracleText.value;

    // In each search funtion this If conditons exists. If there is already text in the search string
    // Then the '+' at the begining is necessary. Otherwise it is not required.
    if (oracleText) {
        if (search !== '') {
            search += `+oracle%3A${oracleText}`;
        } else {
            search += `oracle%3A${oracleText}`
        }
    }
    return search;
}

function searchByCardType(search) {
    const typeLine = elements.apiSearch.typeLine.value;

    if (typeLine) {
        if (search !== '') {
            search += `+type%3A${typeLine}`
        } else {
            search += `type%3A${typeLine}`
        }
    }
    return search;
}

function searchByColor(search) {
    let boxes = elements.apiSearch.colorBoxes;

    // Loop through checkboxes to get all colors given
    var colors = '';
    boxes.forEach(box => {
        if(box.checked) colors += box.value;
    })

    const sortBy = elements.apiSearch.colorSortBy.value;

    // If colors is empty then there is no need to add to the search string
    if (colors) {
        if (search !== '') {
            search += `+color${sortBy}${colors}`;
        } else {
            search += `color${sortBy}${colors}`;
        }
    }
    return search;
}

function searchByStats(search) {
    const stat = elements.apiSearch.stat.value;
    const sortBy = elements.apiSearch.statFilter.value;
    const sortValue = elements.apiSearch.statValue.value;

    // stat and sortBy have values by deault in the HTML form. sortValue is empty.
    // If no value is given by the user then we don't need to alter the search string
    if (sortValue) {
        if (search !== '') {
            search += `+${stat}${sortBy}${sortValue}`
        } else {
            search += `${stat}${sortBy}${sortValue}`
        }
    }
    return search;  
}

function searchByFormat(search) {
    const legalStatus = elements.apiSearch.legalStatus.value;
    const format = elements.apiSearch.format.value;

    // legalStatus has a value by default in the HTML form. If no value is given for format, there is no need to run the code
    if (format) {
        if (search !== '') {
            search += `+${legalStatus}%3A${format}`
        } else {
            search += `${legalStatus}%3A${format}`
        }
    }
    return search;
}

function searchByRarity(search) {
    const boxes = elements.apiSearch.rarityBoxes;
    var values = [];
    var starterString = '';
    var finalString;

    // Push all rarities given by the user into the values array
    boxes.forEach(box => {
        if (box.checked) values.push(box.value);
    })

    if (values.length > 0) {
        // We need a starter string so we can slice it later %28 is an open parentheses 
        starterString += '%28';

        // For every value given by the user we need to add the +OR+
        // to the end for grouping. We will remove the +OR+ from the last
        // iteration of the loop
        values.forEach(value => starterString += `rarity%3A${value}+OR+`);

        // Remove the unnecessary +OR+ at the end
        finalString = starterString.slice(0, -4);

        // Close the parentheses
        finalString += `%29`;

        if (search !== '') {
            search += `+${finalString}`;
        } else {
            search += `${finalString}`;
        }
    }

    return search;
}

function searchByCost(search) {
    const denomination = elements.apiSearch.denomination.value;
    const sortBy = elements.apiSearch.denominationSortBy.value;
    const inputVal = elements.apiSearch.denominatinoSortValue.value;

    if (inputVal) {
        if (search !== '') {
            search += `+${denomination}${sortBy}${inputVal}`
        } else {
            search += `${denomination}${sortBy}${inputVal}`
        }
    }
    return search;
}