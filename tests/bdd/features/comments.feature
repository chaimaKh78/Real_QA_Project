Feature: Comments
  Manage product comments and reviews

  Scenario: TC020 - Voir commentaires
    Given the application is running
    Given I have added a review for product 1 with rating 5 and comment "Great product"
    When I view comments for product 1
    Then the comment should be visible for product 1

  Scenario: TC021 - Login requis pour commenter
    Given the application is running
    When I view comments for product 1
    Then response status should be 200

  Scenario: TC022 - Ajouter commentaire
    Given the application is running
    Given I am logged in as "testuser" with password "password"
    When I submit a review for product 1 with rating 4 and comment "Nice"
    Then response status should be 200

  Scenario: TC023 - Afficher nouveau commentaire
    Given the application is running
    Given I have added a review for product 1 with rating 4 and comment "Nice"
    When I view comments for product 1
    Then the comment should be visible for product 1
