import { generateManaCostImages } from './resultsView'
import { checkListHoverEvents } from './resultsView'

const shortenTypeLine = () => {
    const types = Array.from(document.querySelectorAll(
        '.js--inv-types'
    ));
    types.forEach(type => {
        let html = type.innerHTML;

        // if the — delimiter is found in the string, return everything before the delimiter
        if (html.indexOf('—') !== -1) {
            type.innerHTML = html.substring(0, html.indexOf('—') - 1)
        }
    })
};

const alterManaImages = () => {
    const manaCosts = Array.from(document.querySelectorAll(
        '.js--inv-mana-cost'
    ));

    manaCosts.forEach(cost => {
        cost.innerHTML =  generateManaCostImages(cost.innerHTML);
    })
};

export const alterInventoryTable = () => {
    shortenTypeLine();
    alterManaImages();
    checkListHoverEvents();
}