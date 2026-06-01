Feature: Authentication
  Register, login and password flows

  Scenario: TC030 - Inscription avec succès
    Given the application is running
    When I register with username "newuser", email "newuser@example.com", and password "password"
    Then I should be registered successfully

  Scenario: TC031 - Inscription email existant
    Given the application is running
    Given I have registered with username "existing", email "existing@example.com", and password "password"
    When I register with username "other", email "existing@example.com", and password "password"
    Then I should receive an error "Email already exists"

  Scenario: TC032 - Inscription username existant
    Given the application is running
    Given I have registered with username "sameuser", email "sameuser@example.com", and password "password"
    When I register with username "sameuser", email "other@example.com", and password "password"
    Then I should receive an error "Username already exists"

  Scenario: TC040 - Login avec succès
    Given the application is running
    Given I have registered with username "loginuser", email "login@example.com", and password "password"
    When I login with username "loginuser" and password "password"
    Then I should be logged in successfully

  Scenario: TC041 - Login mauvais identifiants
    Given the application is running
    When I login with username "noone" and password "bad"
    Then I should receive an error "Invalid credentials"

  Scenario: TC042 - Logout
    Given the application is running
    Given I am logged in as "logoutuser" with password "password"
    When I request password reset for email "logoutuser@example.com"
    Then response status should be 200

  Scenario: TC050 - Forgot password
    Given the application is running
    When I request password reset for email "forgot@example.com"
    Then response status should be 404
