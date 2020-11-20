import { elements } from './base';

const clearChecklist = () => {
    const checkList = document.querySelector('.js--card-checklist')
    if (checkList) {
        checkList.parentElement.removeChild(checkList);

        // Remove any tool tip images if user was hovering
        const toolTip = document.querySelector('.tooltip')
        if (toolTip) document.body.removeChild(toolTip);
    }
};


const clearImageGrid = () => {
    const grid = document.querySelector('.js--image-grid')
    if (grid) grid.parentElement.removeChild(grid);
};


const clearResults = () => {
    clearChecklist();
    clearImageGrid();   
}


const prepImageContainer = () => {
    const markup = `
        <div class="image-grid js--image-grid"></div>
    `
    elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
};


const generateImageGrid = cards => {
    cards.forEach(card => {
        if (card.image_uris) {
            var markup = `<div class="image-grid__container"><img src=${card.image_uris.normal} alt="${card.name}" class="image-grid__image"></div>`    
          } else {
            var markup = `
              <div class=image-grid__no-image>
                <p>This card has no image</p>
                <p>${card.name}</p>
                <p>${card.type_line}</p>
                <p>${card.color_identity}</p>
              </div>
            `
        }
        document.querySelector('.js--image-grid').insertAdjacentHTML('beforeend', markup);        
    })
}


// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a images
export const dispalyImages = cards => {
    clearResults();
    prepImageContainer();
    generateImageGrid(cards);
}


const prepChecklistContainer = () => {
    const markup = `
        <table class="card-checklist js--card-checklist">
            <thead>
                <tr class="card-checklist__row card-checklist__row--header">
                    <th class="card-checklist__data">Set</th>
                    <th class="card-checklist__data">Name</th>
                    <th class="card-checklist__data">Cost</th>
                    <th class="card-checklist__data">Type</th>
                    <th class="card-checklist__data">Rarity</th>
                    <th class="card-checklist__data">Artist</th>
                    <th class="card-checklist__data">Price</th>
                </tr>
            </thead>
            <tbody class="js--card-checklist-body"></tbody>
        </table>
        `
    elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
}

export const generateManaCostImages = (manaCost, size='small') => {
    // If there is no mana cost associated with the card, then return an empty string to leave the row empty
    if (!manaCost) return '';

    // Regular expressions to find each set of curly braces
    let re = /\{(.*?)\}/g

    // Parse the strings and get all matches
    let matches = manaCost.match(re);

    // If there are any matches, loop through and replace each set of curly braces with the 
    // html span that correspons to mana.css to render the correct image
    if (matches) {
        matches.forEach(m => {
            const regex = new RegExp(`\{(${m.slice(1, -1)})\}`, 'g');
            manaCost = manaCost.replace(
                regex, 
                `<span class="mana ${size} s${m.slice(1, -1).toLowerCase()}"></span>`
            )
        })
    }

    return manaCost;
}

const shortenTypeLine = type => {
    // If no type is given, return an empty string
    if (!type) return '';

    // if the — delimiter is found in the string, return everything before the delimiter
    if (type.indexOf('—') !== -1) return type.substring(0, type.indexOf('—') - 1);

    // If there is no delimiter, return the type as given in the card object
    return type;    
}

const parseCardName = cardName => {
    if (cardName.indexOf('/') !== -1) {
        return cardName.slice(0, (cardName.indexOf('/') - 1)).replaceAll(' ', '-');
    }

    return cardName.replaceAll(' ', '-');
}

const generateChecklist = cards => {
    // The ctr and isRowGrey function are used to set a class on every other row so it can 
    // be styled grey
    let ctr = 0
    const isRowGrey = ctr => (ctr % 2 === 0 ? 'card-checklist__row--grey' : '')   

    // Create a new table row for each card object
    cards.forEach(card => {
        const cardNameForUrl = parseCardName(card.name);

        const markup = `
            <tr class="js--checklist-row ${isRowGrey(ctr)} card-checklist__row data-component="card-tooltip" data-card-img=${checkForImg(card)}>
                <td class="card-checklist__data card-checklist__data--set"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${card.set}</a></td>
                <td class="card-checklist__data"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${card.name}</a></td>
                <td class="card-checklist__data"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${generateManaCostImages(card.mana_cost)}</a></td>
                <td class="card-checklist__data"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${shortenTypeLine(card.type_line)}</a></td>
                <td class="card-checklist__data card-checklist__data--rarity"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${card.rarity}</a></td>
                <td class="card-checklist__data"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${card.artist}</a></td>
                <td class="card-checklist__data"><a href="/card/${cardNameForUrl}" class="card-checklist__data-link">${card.prices.usd}</a></td>
            </tr>
            `
        // Put the row in the table
        document.querySelector('.js--card-checklist-body').insertAdjacentHTML('beforeend', markup);

        // Increment the ctr
        ctr ++;
    })
}

// Used in the checklist display to check if a card has an image
const checkForImg = card => (card.image_uris ? card.image_uris.normal : 'no-img')


// Create the hover effect on each row that displays the image of the card
const checkListHoverEvents = () => {
    // Get the HTML for each table row
    const rows = Array.from(document.querySelectorAll('.js--checklist-row'));
 
    rows.forEach(row => {
        row.onmousemove = e => {
            // If the window is smaller than 768 pixels, don't display any images
            if (window.innerWidth < 768) return false;

            // If there is already an image being displayed, remove it from the DOM
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            }

            // Prep the div.
            const div = document.createElement('div');
            div.className = 'tooltip';

            // The div is styled with position absolute. This code puts it just to the right of the cursor
            div.style.left = e.pageX + 50 + 'px';
            div.style.top = e.pageY - 30 + 'px';

            // Prep the img element
            const img = document.createElement('img');
            img.className = 'tooltip__img';
            img.src = row.dataset.cardImg;
            
            // Put the img into the div and then append the div directly to the body of the document.
            div.appendChild(img); 
            document.body.appendChild(div);  
            }

        // Remove the img when taking the cursor off the row
        row.onmouseout = e => {
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            }
        }
    })
}


// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a checklist
export const displayChecklist = cards => {
    clearResults();
    prepChecklistContainer();
    generateChecklist(cards);
    checkListHoverEvents();
}


export const choseSelectMenuSort = (menu, state) => {
    // Create an array from the HTML select menu
    const options = Array.from(menu)

    options.forEach((option, i) => {
        // If the option value matches the sort method from the URL, set it to the selected item
        if (option.value === state.sortMethod) menu.selectedIndex = i;
    })
}


export const choseSelectMenuDisplay = (menu, state) => {
    // Create an array from the HTML select menu
    const options = Array.from(menu)

    options.forEach((option, i) => {
        // If the option value matches the sort method from the URL, set it to the selected item
        if (option.value === state.display) menu.selectedIndex = i;
    })
}


// Function to change the sort method based on the input from the user
export const changeSortMethod = state => {
    // Get the current sort method from the end of the URL
    const currentSortMethod = window.location.pathname.substring(
        window.location.pathname.lastIndexOf('=') + 1
    );    

    // Grab the desired sort method from the user
    const newSortMethod = elements.resultsPage.sortBy.value;

    // If the new sort method is not different, exit the function as to not push a new state
    if (currentSortMethod === newSortMethod) {
        return;
    } else {        
        // Disable all four buttons
        // Only doing this because firefox requires a ctrl f5
        disableBtn(elements.resultsPage.firstPageBtn);
        disableBtn(elements.resultsPage.nextPageBtn);
        disableBtn(elements.resultsPage.previousPageBtn);
        disableBtn(elements.resultsPage.lastPageBtn);

        const currentPathName = window.location.pathname.substring(
            0, window.location.pathname.lastIndexOf('=') + 1
        );

        window.location.href = currentPathName + newSortMethod;                
    }
}


export const changeDisplayAndUrl = state => {
    const currentMethod = state.display;
    const newMethod = elements.resultsPage.displaySelector.value;

    if (newMethod === currentMethod) return;

    // Update the state with new display method
    state.display = newMethod;

    // // If the display method has changed, update the URL
    // window.location.pathname = `results/${newMethod}/${state.query}`

    // Update the url without pushing to the server
    const title = document.title;
    const pathName = `/results/${newMethod}/${state.query}`
    history.pushState({
        currentIndex: state.currentIndex,
        display: state.display,
        //cards: state.allCards
    }, title, pathName);

}


export const updateDisplay = state => {
    // Clear any existing HTML in the display
    clearResults();

    // Refresh the display
    if (state.display === 'list') displayChecklist(state.allCards[state.currentIndex]);
    if (state.display === 'images') dispalyImages(state.allCards[state.currentIndex]);
}


// ********************************************** \\
// *************** PAGINATION ******************* \\
// ********************************************** \\

// Will be called during changing pages. Removes the current element in the bar
const clearDisplayBar = () => {
    const displayBarText = document.querySelector('.js--display-bar-text')
    if (displayBarText) displayBarText.parentElement.removeChild(displayBarText);
}    


// Keeps track of where the user is in there list of cards
const paginationTracker = state => {
    var beg, end;
    beg = ((state.currentIndex + 1) * 175) - 174; 
    end = ((state.currentIndex) * 175) + state.allCards[state.currentIndex].length

    return { beg, end };
}


export const updateDisplayBar = state => {
    const markup = `
        <p class="api-results-display__display-bar-text js--display-bar-text">
            Displaying ${paginationTracker(state).beg} - ${paginationTracker(state).end} of ${state.search.results.total_cards} cards
        </p>
    `

    clearDisplayBar();
    elements.resultsPage.displayBar.insertAdjacentHTML('beforeend', markup);
}


export const enableBtn = btn => {
    if (btn.disabled) {
        btn.classList.remove('api-results-display__nav-pagination-container--disabled');
        btn.disabled = false;
    }
}


export const disableBtn = btn => {
    if (!btn.disabled) {
        btn.classList.add('api-results-display__nav-pagination-container--disabled');
        btn.disabled = true;
    }
}


// ********************************************** \\
// *************** ON BACK BUTTON *************** \\
// ********************************************** \\

// const paginationTrackerForPopState = (state, data) => {
//     var beg, end;
//     beg = ((data.currentIndex + 1) * 175) - 174; 
//     end = ((data.currentIndex) * 175) + state.allCards[data.currentIndex].length

//     return { beg, end };
// }


// const updateDisplayBarForPopState = (state, data) => {
//     const markup = `
//         <p class="api-results-display__display-bar-text js--display-bar-text">
//             Displaying ${paginationTrackerForPopState(state, data).beg} - ${paginationTrackerForPopState(state, data).end} of ${state.search.results.total_cards} cards
//         </p>
//     `

//     clearDisplayBar();
//     elements.resultsPage.displayBar.insertAdjacentHTML('beforeend', markup);
// }


// export const updateDisplayOnPopState = (state, data) => {
//     // Clear any existing HTML in the display
//     clearResults();

//     updateDisplayBarForPopState(state, data);    

//     // Refresh the display
//     if (data.display === 'list') displayChecklist(state.allCards[data.currentIndex]);
//     if (data.display === 'images') dispalyImages(state.allCards[data.currentIndex]);
// }

