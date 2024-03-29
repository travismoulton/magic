// import '../css/style.css';
import '../css/vendor/mana.css';
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as resultsView from './views/resultsView';
import * as cardView from './views/cardView';
import * as inventoryView from './views/inventoryView';
import * as invSearch from './views/inventorySearchView';
import { elements } from './views/base';

// ******************************* \\
// *********** Home Page ********* \\
// ******************************* \\
if (window.location.pathname === '/')
  document.body.style.backgroundColor = '#431e3f';

// ******************************* \\
// ********* Quick Search ******** \\
// ******************************* \\
if (elements.nav.quickSearchBtn)
  elements.nav.quickSearchBtn.addEventListener('click', () => {
    const search = new Search();

    if (elements.nav.searchInput.value !== '') {
      const query = search.quickSearch();
      window.location.href = `/results/list/${query}&order=name`;
    }
  });

document.addEventListener('keydown', (e) => {
  const searchIsFocused = document.activeElement === elements.nav.searchInput;
  const hasSearchValue = elements.nav.searchInput
    ? elements.nav.searchInput.value !== ''
    : false;

  if (e.code === 'Enter' && hasSearchValue && searchIsFocused) {
    const search = new Search();
    const query = search.quickSearch();

    window.location.href = `/results/list/${query}&order=name`;
  }
});

const homePageSearch = document.querySelector('.js--homepage-quick-search');

homePageSearch &&
  homePageSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('.js--hompeage-search-input');
    const cardName = input.value;

    window.location.href = `/results/list/${cardName}&order=name`;
  });

// ******************************* \\
// ********* Search Page ********* \\
// ******************************* \\
if (window.location.pathname === '/search') {
  document.body.style.backgroundColor = '#fdfdfd';

  const search = new Search();

  // Event listener for the submit search button. This goes through the form and generates
  // the qujery string. It then passes the string to the server through the URL
  elements.apiSearch.submitBtn.onclick = async (e) => {
    e.preventDefault();

    // Clear any existing query string
    search.resetSearchQuery();

    // Build the query string
    const query = search.buildSearchQuery();

    // Get the display method
    const displayMethod = search.displayMethod();

    // Create a get request with the query string
    window.location.href = `/results/${displayMethod}/${query}`;

    return false;
  };

  elements.apiSearch.typeLine.addEventListener('click', () => {
    // Display the dropdown
    searchView.showTypesDropDown();
    searchView.startTypesDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', searchView.typeLineListener);
  });

  elements.apiSearch.typeLine.addEventListener('input', () => {
    if (elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
      searchView.showTypesDropDown();
    }

    searchView.filterTypes(elements.apiSearch.typeLine.value);
    searchView.filterTypeHeaders();
    searchView.startTypesDropDownNavigation();
  });

  elements.apiSearch.setInput.addEventListener('click', () => {
    // Display the dropdown
    searchView.showSetsDropDown();
    searchView.startSetsDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', searchView.setInputListener);
  });

  elements.apiSearch.setInput.addEventListener('input', () => {
    if (elements.apiSearch.setDropDown.hasAttribute('hidden')) {
      searchView.showSetsDropDown();
    }

    searchView.filterSets(elements.apiSearch.setInput.value);
    searchView.filterSetHeaders();
    searchView.startSetsDropDownNavigation();
  });

  elements.apiSearch.statValue.addEventListener(
    'input',
    searchView.statLineController
  );

  elements.apiSearch.format.addEventListener(
    'change',
    searchView.formatLineController
  );
}

// ******************************* \\
// ********* Results Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 8) === 'results') {
  document.body.style.backgroundColor = '#f5f6f7';

  const state = {
    search: new Search(),

    // Get the display method, sort method, and query from the URL
    display: window.location.pathname.substring(
      9,
      window.location.pathname.lastIndexOf('/')
    ),
    query: window.location.pathname.substring(
      window.location.pathname.lastIndexOf('/') + 1
    ),
    sortMethod: window.location.pathname.substring(
      window.location.pathname.lastIndexOf('=') + 1
    ),

    allCards: [],
    currentIndex: 0,
    allResultsLoaded: false,
  };

  // When the results page is refreshed, display the cards as a checklist by default
  document.addEventListener('DOMContentLoaded', async () => {
    // Update the sort by and display asd menus so the selected option is what the user selected
    resultsView.choseSelectMenuSort(
      elements.resultsPage.sortBy().options,
      state
    );
    resultsView.choseSelectMenuDisplay(
      elements.resultsPage.displaySelector(),
      state
    );

    // Run the get cards function, then update the display bar with the total card count
    await state.search.getCards(state);

    if (state.allCards[0] === 404) {
      resultsView.display404();
      return;
    }

    resultsView.updateDisplayBar(state);

    // In the background, get all cards
    state.search.getAllCards(state, resultsView.enableBtn);

    // On loading the page display the cards in a checklist
    resultsView.updateDisplay(state);
  });

  // Event listener for the change display method button
  elements.resultsPage.btn().onclick = async () => {
    // Update the display method between checklist and cards if the user changed it
    resultsView.changeDisplayAndUrl(state);

    // If a new sorting method is selected, a request is sent to the server and the page is refreshed.
    // This resets the state and async tasks
    resultsView.changeSortMethod(state);

    // Update the display with a new sort method and display method if either were given
    resultsView.updateDisplay(state);
  };

  // Event Listener for next page button
  elements.resultsPage.nextPageBtn().onclick = () => {
    // Update the index
    state.currentIndex++;

    // Update the display based on the method stored in the state
    resultsView.updateDisplay(state);

    // Update the display bar
    resultsView.updateDisplayBar(state);

    // Enable the previous page and first page btns
    resultsView.enableBtn(elements.resultsPage.previousPageBtn());
    resultsView.enableBtn(elements.resultsPage.firstPageBtn);

    // If on the last page, disable the next page btn and last page btn
    if (state.currentIndex === state.allCards.length - 1) {
      resultsView.disableBtn(elements.resultsPage.nextPageBtn());
      resultsView.disableBtn(elements.resultsPage.lastPageBtn);
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
    resultsView.disableBtn(elements.resultsPage.nextPageBtn());
    resultsView.disableBtn(elements.resultsPage.lastPageBtn);

    // Enable the previous and first page buttons
    resultsView.enableBtn(elements.resultsPage.previousPageBtn());
    resultsView.enableBtn(elements.resultsPage.firstPageBtn);
  };

  // Event listener for the previous page button
  elements.resultsPage.previousPageBtn().onclick = () => {
    // Update the index
    state.currentIndex--;

    // Update the display based on the method stored in the state
    resultsView.updateDisplay(state);

    // Update the display bar
    resultsView.updateDisplayBar(state);

    // If on the first page, disable the previous and first page buttons
    if (state.currentIndex === 0) {
      resultsView.disableBtn(elements.resultsPage.previousPageBtn());
      resultsView.disableBtn(elements.resultsPage.firstPageBtn);
    }

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    resultsView.enableBtn(elements.resultsPage.nextPageBtn());
    if (state.allResultsLoaded)
      resultsView.enableBtn(elements.resultsPage.lastPageBtn);
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
    resultsView.disableBtn(elements.resultsPage.previousPageBtn());
    resultsView.disableBtn(elements.resultsPage.firstPageBtn);

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    resultsView.enableBtn(elements.resultsPage.nextPageBtn());
    if (state.allResultsLoaded)
      resultsView.enableBtn(elements.resultsPage.lastPageBtn);
  };

  window.onpopstate = (e) => {
    window.location.href = `/search`;
  };

  // Mobile display menu
  if (document.querySelector('.js--mobile-display-options')) {
    document
      .querySelector('.js--mobile-display-options')
      .addEventListener('click', () => {
        if (
          document.querySelector('.js--mobile-display-menu').style.display ===
          'flex'
        ) {
          document.querySelector('.js--mobile-display-menu').style.display =
            'none';
        } else {
          document.querySelector('.js--mobile-display-menu').style.display =
            'flex';
        }
      });
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
  cardView.shortenCardName();

  // If the transform btn is on the dom (if the card is double sided) set
  // the event listener for the card to be flipped back and forth
  if (elements.card.transformBtn) {
    elements.card.transformBtn.addEventListener(
      'click',
      cardView.flipToBackSide
    );
  }

  if (document.querySelector('.js--add-to-inv-submit')) {
    document
      .querySelector('.js--add-to-inv-submit')
      .addEventListener('click', cardView.checkPriceInputForDigits);
  }
}

// ******************************* \\
// ******* Inventory Page ******** \\
// ******************************* \\
if (window.location.pathname.startsWith('/inventory')) {
  document.body.style.backgroundColor = '#f5f6f7';
  document.addEventListener(
    'DOMContentLoaded',
    inventoryView.alterInventoryTable
  );
}

// ******************************* \\
// **** Inventory Search Page **** \\
// ******************************* \\
if (document.querySelector('.js--inv-search-btn')) {
  document.body.style.backgroundColor = '#fdfdfd';

  if (document.querySelector('.js--inv-search-btn')) {
    document
      .querySelector('.js--inv-search-btn')
      .addEventListener('click', invSearch.checkPriceInputForDigits);

    elements.apiSearch.typeLine.addEventListener('click', () => {
      // Display the dropdown
      searchView.showTypesDropDown();
      invSearch.startTypesDropDownNavigation();

      // Start an event listener on the document. This will close the dropdown if the user clicks
      // outside of the input or dropdown. This will also cancel the event listener
      document.addEventListener('click', invSearch.typeLineListener);
    });

    elements.apiSearch.typeLine.addEventListener('input', () => {
      if (elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
        searchView.showTypesDropDown();
      }

      searchView.filterTypes(elements.apiSearch.typeLine.value);
      searchView.filterTypeHeaders();
      invSearch.startTypesDropDownNavigation();
    });

    elements.apiSearch.setInput.addEventListener('click', () => {
      // Display the dropdown
      searchView.showSetsDropDown();
      invSearch.startSetsDropDownNavigation();

      // Start an event listener on the document. This will close the dropdown if the user clicks
      // outside of the input or dropdown. This will also cancel the event listener
      document.addEventListener('click', invSearch.setInputListener);
    });

    elements.apiSearch.setInput.addEventListener('input', () => {
      if (elements.apiSearch.setDropDown.hasAttribute('hidden')) {
        searchView.showSetsDropDown();
      }

      searchView.filterSets(elements.apiSearch.setInput.value);
      searchView.filterSetHeaders();
      invSearch.startSetsDropDownNavigation();
    });
  }
}

if (window.location.pathname.includes('/card')) {
  document.body.style.backgroundColor = '#f5f6f7';
}

// ******************************* \\
// ****** Mobile Nav Button ****** \\
// ******************************* \\

if (document.querySelector('.js--nav-hamburger')) {
  document.querySelector('.js--nav-hamburger').addEventListener('click', () => {
    if (document.querySelector('.js--mobile-links').style.display === 'flex') {
      document.querySelector('.js--mobile-links').style.display = 'none';
    } else {
      document.querySelector('.js--mobile-links').style.display = 'flex';
    }
  });
}

if (
  window.location.pathname.includes('/login') ||
  window.location.pathname.includes('/register')
)
  document.body.style.backgroundColor = '#431e3f';
