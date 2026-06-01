Feature: Password Reset
  As a user
  I want to request a password reset and set a new password
  So that I can recover access to my account

  Background:
    Given the application is running

  Scenario: Reset password successfully
    Given I have registered with username "resetuser" and email "reset@example.com" and password "password123"
    When I request password reset for email "reset@example.com"
    And I reset the password using token from the last reset to "newpassword123"
    Then I should be able to login with username "resetuser" and password "newpassword123"

  Scenario: Reset password with invalid token
    When I reset the password using token "invalid" to "newpassword123"
    Then I should receive an error "Invalid token"
