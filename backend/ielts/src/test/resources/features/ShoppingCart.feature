Feature: Shopping Cart

  Scenario: Customer adds a product to the shopping cart
    Given an empty shopping cart
    When the customer adds "Laptop" to the cart
    Then the cart should contain "Laptop"
    And the cart count should be 1


  Scenario: Customer removes a product from the shopping cart
    Given a shopping cart containing "Smartphone"
    When the customer removes "Smartphone" from the cart
    Then the cart should not contain "Smartphone"
    And the cart count should be 0