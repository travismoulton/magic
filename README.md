# MTG Power Search

This app is built using the Scryfall API, and also uses their design as well. Huge thanks to the Scryfall team for use of their API, and for the inspiration.

[Check out the site here](https://mtgpowersearch.com)

### The tech I used.

This project is built using Flask and Python on the backend with vanilla JS, html, and SASS on the front. I used BEM for naming classes. The databse is postgres with SQLAlchemy used in flask as an ORM. User passwords are encrypted by sha_256 to keep them secure. The app is deployed on heroku, and the SSL is through cloudflare. It also features a built by hand webpack config. The backend uses celery to update the user's inventory value once per day (only if they login) asynchronously upon arrival to the site.

### About this app.

This app is hosted as a free project on Heroku so it will take a few moments to load the first time. This app is a search engine for magic the gathering cards. It features robust search features that allow the user to search by card name, text, type, colors, sets, and more! The user has multiple ways to display and sort the results. The results can be displayed in a chart wirt 175 results per page and information about each card, or as a grid of images. You can also sort the cards by release date, power, price, and more options. Clicking on any card in the display will load a page with further details abot the card. Formats it's legal in, card text and abilities, and a list of other prints and their prices.

The app also features an authentication system that allows users to register / login. Registered users can keep track of their inventory of magic cards using the app. Cards can be added through the card detail page. Users with large amounts of inventory can also search their inventory with same advanced features as the general search page. The inventory page will show the card's current value, the price the user purchased it at (This will default to the current card value if the user doesn't explicitly enter a value), and also show the gain / loss invalue. The user's inventory page also shows the total value of your inventory.

### Thanks for taking the time to check out my project!
