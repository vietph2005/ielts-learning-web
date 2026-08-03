package web.ielts.features;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class ShoppingCartSteps {
	private ShoppingCart cart;

	@Given("an empty shopping cart")
	public void an_empty_shopping_cart() {
		cart = new ShoppingCart();
	}

	@Given("a shopping cart containing {string}")
	public void a_shopping_cart_containing(String product) {
		cart = new ShoppingCart();
		cart.addProduct(product);
	}

	@When("the customer adds {string} to the cart")
	public void the_customer_adds_to_the_cart(String product) {
		cart.addProduct(product);
	}

	@When("the customer removes {string} from the cart")
	public void the_customer_removes_from_the_cart(String product) {
		cart.removeProduct(product);
	}

	@Then("the cart should contain {string}")
	public void the_cart_should_contain(String product) {
		assertTrue(cart.getItems().contains(product));
	}

	@Then("the cart should not contain {string}")
	public void the_cart_should_not_contain(String product) {
		assertFalse(cart.getItems().contains(product));
	}

	@And("the cart count should be {int}")
	public void the_cart_count_should_be(Integer count) {
		assertEquals(count.intValue(), cart.getItemCount());
	}
}
