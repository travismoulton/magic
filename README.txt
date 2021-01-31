First off, thank you to Scryfall for use of their API. I also copied the design of the scryfall site, so all credit for the design goes to them.

This hobby project functions as a search engine for magic the gathering cards. It features a robust search and filtering feature to search for cards by set, type, abilities, set, price, and more.

This site is built with flask on the backend with a little bit of celery for background tasks, postgres for a DB, Sass, vanilla javascript, and webpack as a bundler.

It also has functionality to allow users to create an account, and keep track of their inventory of cards. They can track what price they paid for a card so they can see the increase or decrease in value of their cards over time. Every 24 hours, on their first login, the site fetches the up to date price in the background.

The app is deployed to heroku at sample-magic-app.herokuapp.com

This was my first big portfolio project, and I had a lot of fun building it. This was also the first time I worked with an API outside of tutorials.