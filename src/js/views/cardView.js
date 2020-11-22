import { generateManaCostImages } from './resultsView';
import { elements } from './base';

export const insertManaCostToCardTextTitle = () => {
    elements.card.manaCostTitleSpan.innerHTML = generateManaCostImages(
        elements.card.manaCostTitleSpan.getAttribute('data-mana-cost')
    );
};


export const insertManaCostToOracleText = () => {
    const oracleTexts = Array.from(elements.card.oracleTexts);

    if (oracleTexts.length > 0) {
        oracleTexts.forEach(text => text.innerHTML = generateManaCostImages(
            text.innerHTML, 'xs'
        ));
    }    
};


export const removeUnderScoreFromLegalStatus = () => {
    const legalities = Array.from(elements.card.legalities);

    legalities.forEach(legality => {
        if (legality.innerHTML.includes('_')) {
            legality.innerHTML = legality.innerHTML.replace('_', ' ');
        }
    });
};


export const fixCardPrices = () => {
    const prices = Array.from(elements.card.prices);

    prices.forEach(price => {
        if (price.innerHTML.includes('None')) price.innerHTML = '-'
    });
};


// Create the hover effect on each row that displays the image of the card
export const printListHoverEvents = () => {
    // Get the HTML for each table row
    const prints = Array.from(elements.card.printRows);
 
    prints.forEach(print => {
        print.onmousemove = e => {
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
            img.src = print.getAttribute('data-cardImg');
            console.log(img.src);
            
            // Put the img into the div and then append the div directly to the body of the document.
            div.appendChild(img); 
            document.body.appendChild(div);  
            }

        // Remove the img when taking the cursor off the print
        print.onmouseout = e => {
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            }
        }
    })
}

