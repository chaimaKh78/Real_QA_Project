Feature: Cart
  Ensure cart behaviour is correct

  Scenario: TC010 - View cart vide
    Given the application is running
    Given my cart is empty
    When I view my cart
    Then my cart should be empty

  Scenario: TC011 - Ajouter produit au cart
    Given the application is running
    When I add product with id 1 to my cart with quantity 1
    Then the cart should contain product 1 with quantity 1

  Scenario: TC012 - Augmenter quantité
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I update the quantity of product 1 in my cart to 2
    Then the cart should contain product 1 with quantity 2

  Scenario: TC013 - Diminuer quantité
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 2
    When I update the quantity of product 1 in my cart to 1
    Then the cart should contain product 1 with quantity 1

  Scenario: TC014 - Supprimer article
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I remove product 1 from my cart
    Then the cart should not contain product 1

  Scenario: TC015 - Total correct
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 2
    When I view my cart
    Then the total price should be calculated correctly

  Scenario: TC016 - Checkout
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I checkout with name "Test User", email "test@example.com", address "123 Main St", and phone "1234567890"
    Then an order should be created successfully
