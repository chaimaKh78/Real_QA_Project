Feature: Checkout
  Ensure checkout form validation and order processing

  Scenario: TC060 - Valider formulaire vide
    Given the application is running
    When I attempt to checkout with incomplete information
    Then response status should be 400

  Scenario: TC061 - Valider email invalide
    Given the application is running
    When I attempt to checkout with name "Test", email "invalid", address "Some", and phone "123"
    Then response status should be 400

  Scenario: TC062 - Soumettre commande
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I checkout with name "Buyer", email "buyer@example.com", address "1 Road", and phone "000"
    Then an order should be created successfully

  Scenario: TC063 - Confirmation commande
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I checkout with name "Buyer", email "buyer@example.com", address "1 Road", and phone "000"
    Then I should receive an order confirmation

  Scenario: TC064 - Panier vidé
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    When I checkout with name "Buyer", email "buyer@example.com", address "1 Road", and phone "000"
    Then my cart should be empty
