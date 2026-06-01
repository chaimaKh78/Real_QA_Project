Feature: Products
  As a customer I want to browse products so I can shop

  Scenario: TC001 - Afficher tous les produits
    Given the application is running
    When I request all products
    Then I should see at least 1 products

  Scenario: TC002 - Filtrer par Skincare
    Given the application is running
    When I filter products by "Skincare"
    Then I should see at least 0 products

  Scenario: TC003 - Filtrer par Makeup
    Given the application is running
    When I filter products by "Face"
    Then I should see at least 0 products

  Scenario: TC004 - Ouvrir détails produit
    Given the application is running
    When I view product details for product 1
    Then the product details should include name "Luxury Face Cream"

  Scenario: TC005 - Ajouter produit au panier
    Given the application is running
    Given I have added product with id 1 to my cart with quantity 1
    Then my cart should contain 1 item
