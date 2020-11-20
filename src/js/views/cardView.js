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

