package web.ielts.features;

import java.util.ArrayList;
import java.util.List;

public class ShoppingCart {
    private List<String> items;

    public ShoppingCart() {
        items = new ArrayList<>();
    }

    // Thêm sản phẩm vào giỏ
    public void addProduct(String product) {
        items.add(product);
    }

    // Xóa sản phẩm khỏi giỏ
    public void removeProduct(String product) {
        items.remove(product);
    }

    // Lấy danh sách sản phẩm
    public List<String> getItems() {
        return items;
    }

    // Lấy số lượng sản phẩm
    public int getItemCount() {
        return items.size();
    }
}
