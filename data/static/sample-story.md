# Add a product to the cart from the inventory page

As a shopper
I want to add an item to my cart
So that I can buy it later

## Scenario: single item

Given I am on the inventory page
When I add "Sauce Labs Backpack" to the cart
Then the cart badge shows "1"
And the cart page lists "Sauce Labs Backpack"
