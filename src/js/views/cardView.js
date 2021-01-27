import { generateManaCostImages } from './resultsView';
import { elements } from './base';

export const insertManaCostToCardTextTitle = () => {
  const manaCosts = Array.from(elements.card.manaCostTitleSpan);

  manaCosts.forEach((cost) => {
    cost.innerHTML = generateManaCostImages(
      cost.getAttribute('data-mana-cost')
    );
  });
};

export const insertManaCostToOracleText = () => {
  const oracleTexts = Array.from(elements.card.oracleTexts);

  if (oracleTexts.length > 0) {
    oracleTexts.forEach(
      (text) => (text.innerHTML = generateManaCostImages(text.innerHTML, 'xs'))
    );
  }
};

export const removeUnderScoreFromLegalStatus = () => {
  const legalities = Array.from(elements.card.legalities);

  legalities.forEach((legality) => {
    if (legality.innerHTML.includes('_')) {
      legality.innerHTML = legality.innerHTML.replace('_', ' ');
    }
  });
};

export const fixCardPrices = () => {
  const prices = Array.from(elements.card.prices);

  prices.forEach((price) => {
    if (price.innerHTML.includes('None')) price.innerHTML = '-';
  });
};

const fixDoubleSidedCardName = (cardName) => {
  if (cardName.includes('/')) {
    cardName = cardName.substring(0, cardName.indexOf('/') - 1);
  }
  return cardName;
};

export const setPrintLinkHref = () => {
  const links = Array.from(elements.card.cardPrintLinks);

  links.forEach((link) => {
    let cardName = link.getAttribute('data-name').replaceAll(' ', '-');
    cardName = fixDoubleSidedCardName(cardName);
    const setCode = link.getAttribute('data-set');

    link.href = `/card/${setCode}/${cardName}`;
  });
};

const setDoubleSidedTransition = () => {
  // Checks to see if an inline style has been set for the front of the card.
  // If not, set a transiton. This makes sure we don't set the transiton every
  // time the card is flipped.

  if (!elements.card.front.getAttribute('style')) {
    elements.card.front.style.transition = `all .8s ease`;
    elements.card.back.style.transition = `all .8s ease`;
  }
};

export const flipToBackSide = () => {
  // Sets the transition property on both sides of the card the first time the
  // transform button is clicked
  setDoubleSidedTransition();

  // Rotates the card to show the backside.
  elements.card.front.style.transform = `rotateY(-180deg)`;
  elements.card.back.style.transform = `rotateY(0)`;

  // Reset the event listener so that on clicking the button it will flip
  // back to the front of the card
  elements.card.transformBtn.removeEventListener('click', flipToBackSide);
  elements.card.transformBtn.addEventListener('click', flipToFrontSide);
};

export const flipToFrontSide = () => {
  elements.card.front.style.transform = `rotateY(0)`;
  elements.card.back.style.transform = `rotateY(180deg)`;

  // Reset the event listener so that on clicking the button it will flip
  // to the backside of the card
  elements.card.transformBtn.removeEventListener('click', flipToFrontSide);
  elements.card.transformBtn.addEventListener('click', flipToBackSide);
};

// Create the hover effect on each row that displays the image of the card
export const printListHoverEvents = () => {
  // Get the HTML for each table row
  const prints = Array.from(elements.card.printRows);

  prints.forEach((print) => {
    print.onmousemove = (e) => {
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

      // Put the img into the div and then append the div directly to the body of the document.
      div.appendChild(img);
      document.body.appendChild(div);
    };

    // Remove the img when taking the cursor off the print
    print.onmouseout = (e) => {
      if (document.querySelector('.tooltip')) {
        document.body.removeChild(document.querySelector('.tooltip'));
      }
    };
  });
};

export const shortenCardName = () => {
  const names = Array.from(document.querySelectorAll('.js--card-name'));
  console.log(names);

  names.forEach((n) => {
    if (n.innerText.includes('/')) {
      n.innerHTML = n.innerHTML.substring(0, n.innerHTML.indexOf('/') - 1);
    }
  });
};

export const checkPriceInputForDigits = (e) => {
  const priceInput = document.querySelector('.js--add-to-inv-price').value;

  if (isNaN(priceInput) && priceInput !== '') {
    e.preventDefault();
    renderPriceInputErrorMessage();
    return false;
  }
};

const renderPriceInputErrorMessage = () => {
  const priceInputDiv = document.querySelector('.js--add-to-inv-price-div');
  const msg = `<p class="add-to-inv-price-msg">Invalid price. Must be a number.</p>`;

  if (!document.querySelector('.add-to-inv-price-msg')) {
    priceInputDiv.insertAdjacentHTML('beforeend', msg);
  }
};
