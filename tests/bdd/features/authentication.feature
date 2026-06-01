Feature: User Authentication
  As a customer
  I want to be able to register and login
  So that I can access my account and make purchases

  Background:
    Given the application is running

  Scenario: Successful user registration
    When I register with username "newuser", email "newuser@example.com", and password "password123"
    Then I should be registered successfully
    And I should be logged in

  Scenario: Successful login
    Given I have registered with username "testuser", email "testuser@example.com", and password "password123"
    When I login with username "testuser" and password "password123"
    Then I should be logged in successfully

  Scenario: Failed login with wrong password
    Given I have registered with username "testuser2", email "testuser2@example.com", and password "password123"
    When I login with username "testuser2" and password "wrongpassword"
    Then I should receive an error "Invalid credentials"

  Scenario: Registration with existing username
    Given I have registered with username "existinguser", email "existing@example.com", and password "password123"
    When I register with username "existinguser", email "different@example.com", and password "password456"
    Then I should receive an error "Username already exists"

  Scenario: Registration with existing email
    Given I have registered with username "user1", email "same@example.com", and password "password123"
    When I register with username "user2", email "same@example.com", and password "password456"
    Then I should receive an error "Email already exists"