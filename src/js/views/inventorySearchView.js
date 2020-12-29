import { elements } from './base';
import * as searchView from './searchView';

export const checkPriceInputForDigits = (e) => {
  const priceInput = document.querySelector('.js--inv-denomination-sort-value')
    .value;

  if (isNaN(priceInput) && priceInput !== '') {
    e.preventDefault();
    renderPriceInputErrorMessage();
    return false;
  }
};

const renderPriceInputErrorMessage = () => {
  const priceInputDiv = document.querySelector('.js--inv-search-price-div');
  const msg = `<p class="inv-search-price-msg">Invalid price. Must be a number.</p>`;

  if (!document.querySelector('.inv-search-price-msg')) {
    priceInputDiv.insertAdjacentHTML('beforeend', msg);
  }
};

// ******************************* \\
// ********** TYPE LINE ********** \\
// ******************************* \\

const hideTypesDropDownButKeepValue = () => {
  if (!elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
    elements.apiSearch.typeDropDown.setAttribute('hidden', 'true');
    document.removeEventListener('keydown', navigateTypesDropDown);
  }
};

export const startTypesDropDownNavigation = () => {
  document.removeEventListener('keydown', navigateTypesDropDown);
  const firstType = document.querySelector('.js--type:not([hidden])');
  searchView.highlightType(firstType);
  searchView.hoverOverTypesListener();
  document.addEventListener('keydown', navigateTypesDropDown);
  elements.apiSearch.typeDropDown.scrollTop = 0;
};

const navigateTypesDropDown = (e) => {
  const types = Array.from(
    document.querySelectorAll('.js--type:not([hidden])')
  );
  const i = types.indexOf(document.querySelector('.js--highlighted'));

  if (e.code === 'ArrowDown' && i < types.length - 1) {
    e.preventDefault();
    searchView.removeCurrentHighlight();
    searchView.highlightType(types[i + 1]);

    searchView.setScrollTopOnDownArrow(
      types[i + 1],
      elements.apiSearch.typeDropDown
    );
  }

  if (e.code === 'ArrowUp') {
    e.preventDefault();

    // We always want to prevent the default. We only want to change the
    // highlight if not on the top type in the dropdown
    if (i > 0) {
      searchView.removeCurrentHighlight();
      searchView.highlightType(types[i - 1]);

      searchView.setScrollTopOnUpArrow(
        types[i - 1],
        elements.apiSearch.typeDropDown
      );
    }
  }

  if (e.code === 'Enter') {
    e.preventDefault();
    setInputValue(
      document.querySelector('.js--highlighted').getAttribute('data-type')
    );
    hideTypesDropDownButKeepValue();
  }
};

const setInputValue = (type) => {
  document.querySelector('.js--api-type-line').value = type;
};

export const typeLineListener = (e) => {
  // If the target is not Type Line input line, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== elements.apiSearch.typeLine &&
    !e.target.matches('.js--api-dropdown-types-list')
  ) {
    searchView.hideTypesDropDown();
    document.removeEventListener('click', typeLineListener);
    // If the target is one if types, get the data type
  } else if (e.target.hasAttribute('data-type')) {
    setInputValue(e.target.getAttribute('data-type'));
    elements.apiSearch.typeLine.focus();
    hideTypesDropDownButKeepValue();
  }
};

// ******************************* \\
// ************* SETS ************ \\
// ******************************* \\

const hideSetsDropDownButKeepValue = () => {
  if (!elements.apiSearch.setDropDown.hasAttribute('hidden')) {
    elements.apiSearch.setDropDown.setAttribute('hidden', 'true');
    document.removeEventListener('keydown', navigateSetsDropDown);
  }
};

const navigateSetsDropDown = (e) => {
  const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));
  const i = sets.indexOf(document.querySelector('.js--highlighted'));

  if (e.code === 'ArrowDown' && i < sets.length - 1) {
    e.preventDefault();
    searchView.removeCurrentHighlight();
    searchView.highlightSet(sets[i + 1]);

    searchView.setScrollTopOnDownArrow(
      sets[i + 1],
      elements.apiSearch.setDropDown
    );
  }

  if (e.code === 'ArrowUp' && i > 0) {
    e.preventDefault();
    searchView.removeCurrentHighlight();
    searchView.highlightSet(sets[i - 1]);

    searchView.setScrollTopOnUpArrow(
      sets[i - 1],
      elements.apiSearch.setDropDown
    );
  }

  if (e.code === 'Enter') {
    e.preventDefault();

    addSet(
      document.querySelector('.js--highlighted').getAttribute('data-set-name')
    );

    hideSetsDropDownButKeepValue();
  }
};

export const startSetsDropDownNavigation = () => {
  const firstSet = document.querySelector('.js--set:not([hidden])');
  searchView.highlightSet(firstSet);
  searchView.hoverOverSetsListener();
  document.addEventListener('keydown', navigateSetsDropDown);
  elements.apiSearch.setDropDown.scrollTop = 0;
};

const addSet = (setName) => {
  elements.apiSearch.setInput.value = setName;
};

export const setInputListener = (e) => {
  // If the target is not the set input field, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== elements.apiSearch.setInput &&
    !e.target.matches('.js--api-dropdown-sets-list')
  ) {
    searchView.hideSetsDropDown();
    document.removeEventListener('click', setInputListener);
    // If the target is one of the set options, toggle it as selected, add it to the list,
    // and hide the dropdown.
  } else if (e.target.hasAttribute('data-set-name')) {
    addSet(e.target.getAttribute('data-set-name'));
    elements.apiSearch.setInput.focus();
    hideSetsDropDownButKeepValue();
  }
};
