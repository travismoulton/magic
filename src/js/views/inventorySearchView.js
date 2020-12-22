export const checkPriceInputForDigits = e => {
    const priceInput = document.querySelector('.js--inv-denomination-sort-value').value;

    if (isNaN(priceInput) && priceInput !== '') {
        e.preventDefault();
        renderPriceInputErrorMessage();
        return false;
    }
}

const renderPriceInputErrorMessage = () => {
    const priceInputDiv = document.querySelector('.js--inv-search-price-div');
    const msg = `<p class="inv-search-price-msg">Invalid price. Must be a number.</p>`;

    if (!document.querySelector('.inv-search-price-msg')) {
        priceInputDiv.insertAdjacentHTML('beforeend', msg);
    }    
}