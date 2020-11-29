import '../css/style.css';
import '../css/vendor/mana.css';
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as resultsView from './views/resultsView';
import * as cardView from './views/cardView';
import { elements } from './views/base';



// ******************************* \\
// ********* Search Page ********* \\
// ******************************* \\
if (window.location.pathname === '/search') {
    const search = new Search();

    // Event listener for the submit search button. This goes through the form and generates
    // the qujery string. It then passes the string to the server through the URL
    elements.apiSearch.submitBtn.onclick = async e => {
        e.preventDefault()

        // Clear any existing query string
        search.resetSearchQuery();
    
        // Build the query string
        const query = search.buildSearchQuery();

        // Get the display method
        const displayMethod = search.displayMethod();

        // Create a get request with the query string
        window.location.href = `/results/${displayMethod}/${query}`;
    
        return false
    }

    elements.apiSearch.typeLine.addEventListener('focus', () => {
        // Display the dropdown
        searchView.showTypesDropDown();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', searchView.typeLineListener)
    })

    elements.apiSearch.typeLine.addEventListener('input', () => {
        searchView.filterTypes(elements.apiSearch.typeLine.value);
        searchView.filterTypeHeaders();
    })

    elements.apiSearch.setInput.addEventListener('focus', () => {
        // Display the dropdown
        searchView.showSetsDropDown();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', searchView.setInputListener)
    })

    elements.apiSearch.setInput.addEventListener('input', () => {
        searchView.filterSets(elements.apiSearch.setInput.value);
        searchView.filterSetHeaders();
    })
} 

 
// ******************************* \\
// ********* Results Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 8) === 'results') {
    const state = {
        search: new Search(),

        // Get the display method, sort method, and query from the URL
        display: window.location.pathname.substring(9, window.location.pathname.lastIndexOf('/')),
        query: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
        sortMethod: window.location.pathname.substring(window.location.pathname.lastIndexOf('=') + 1),

        allCards: [],
        currentIndex: 0,
        allResultsLoaded: false,
    };

    // When the results page is refreshed, display the cards as a checklist by default
    document.addEventListener('DOMContentLoaded', async () => {
        // Update the sort by and display asd menus so the selected option is what the user selected
        resultsView.choseSelectMenuSort(elements.resultsPage.sortBy.options, state);
        resultsView.choseSelectMenuDisplay(elements.resultsPage.displaySelector, state)

        // Run the get cards function, then update the display bar with the total card count
        await state.search.getCards(state);
        resultsView.updateDisplayBar(state);
        console.log(state.search.cards);
        console.log(state.query)

        // In the background, get all cards 
        state.search.getAllCards(state, resultsView.enableBtn);

        // On loading the page display the cards in a checklist
        resultsView.updateDisplay(state);
    });

    // Event listener for the change display method button
    elements.resultsPage.btn.onclick = async () => {
        // Update the display method between checklist and cards if the user changed it
        resultsView.changeDisplayAndUrl(state);

        // If a new sorting method is selected, a request is sent to the server and the page is refreshed.
        // This resets the state and async tasks
        resultsView.changeSortMethod(state);
        
        // Update the display with a new sort method and display method if either were given
        resultsView.updateDisplay(state);
    };

    // Event Listener for next page button
    elements.resultsPage.nextPageBtn.onclick = () => {
        // Update the index
        state.currentIndex ++;
        
        // Update the display based on the method stored in the state
        resultsView.updateDisplay(state);

        // Update the display bar
        resultsView.updateDisplayBar(state);

        // Enable the previous page and first page btns
        resultsView.enableBtn(elements.resultsPage.previousPageBtn);
        resultsView.enableBtn(elements.resultsPage.firstPageBtn);

        // If on the last page, disable the next page btn and last page btn
        if (state.currentIndex === (state.allCards.length - 1)) {
            resultsView.disableBtn(elements.resultsPage.nextPageBtn);
            resultsView.disableBtn(elements.resultsPage.lastPageBtn)
        }
    };

    // Event listener for the last page btn
    elements.resultsPage.lastPageBtn.onclick = () => {
        // Update the index
        state.currentIndex = state.allCards.length - 1;

        // Update the display based on the method stored in the state
        resultsView.updateDisplay(state);

        // Update the display bar
        resultsView.updateDisplayBar(state);

        // Disable the next and last page buttons
        resultsView.disableBtn(elements.resultsPage.nextPageBtn);
        resultsView.disableBtn(elements.resultsPage.lastPageBtn);

        // Enable the previous and first page buttons
        resultsView.enableBtn(elements.resultsPage.previousPageBtn);
        resultsView.enableBtn(elements.resultsPage.firstPageBtn);
    };

    // Event listener for the previous page button
    elements.resultsPage.previousPageBtn.onclick = () => {
        // Update the index
        state.currentIndex --;

        // Update the display based on the method stored in the state
        resultsView.updateDisplay(state);

        // Update the display bar
        resultsView.updateDisplayBar(state);

        // If on the first page, disable the previous and first page buttons
        if (state.currentIndex === 0) {
            resultsView.disableBtn(elements.resultsPage.previousPageBtn);
            resultsView.disableBtn(elements.resultsPage.firstPageBtn);
        }

        // Enable the next and last page buttons. The last page button should only be 
        // enabled if all results have been loaded
        resultsView.enableBtn(elements.resultsPage.nextPageBtn);
        if (state.allResultsLoaded) resultsView.enableBtn(elements.resultsPage.lastPageBtn);
    };

    // Event listener for the first page btn
    elements.resultsPage.firstPageBtn.onclick = () => {
        // Update the index
        state.currentIndex = 0;

        // Update the display based on the method stored in the state
        resultsView.updateDisplay(state);

        // Update the display bar
        resultsView.updateDisplayBar(state);

        // Disable the previous and first page buttons
        resultsView.disableBtn(elements.resultsPage.previousPageBtn);
        resultsView.disableBtn(elements.resultsPage.firstPageBtn);

        // Enable the next and last page buttons. The last page button should only be 
        // enabled if all results have been loaded
        resultsView.enableBtn(elements.resultsPage.nextPageBtn);
        if (state.allResultsLoaded) resultsView.enableBtn(elements.resultsPage.lastPageBtn);
    }

    window.onpopstate = e => {
        // const data = e.state;
        // if (data !== null) resultsView.updateDisplayOnPopState(state, data);

        window.location.href = `/search`;
    }
}


// ******************************* \\
// *********** Card Page ********* \\
// ******************************* \\
if (window.location.pathname.substring(1, 5) === 'card') {
    cardView.insertManaCostToCardTextTitle();

    cardView.insertManaCostToOracleText();

    cardView.removeUnderScoreFromLegalStatus();

    cardView.fixCardPrices();

    cardView.setPrintLinkHref();

    cardView.printListHoverEvents();

    // If the transform btn is on the dom (if the card is double sided) set
    // the event listener for the card to be flipped back and forth
    if (elements.card.transformBtn) {
        elements.card.transformBtn.addEventListener(
            'click', cardView.flipToBackSide
        );
    }
}