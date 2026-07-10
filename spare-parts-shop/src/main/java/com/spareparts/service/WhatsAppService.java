package com.spareparts.service;

import com.spareparts.model.Customer;
import com.spareparts.model.Product;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public String handleIncomingMessage(String fromPhone, String body) {
        // Strip the "whatsapp:" prefix if present
        String cleanPhone = fromPhone.replace("whatsapp:", "").trim();
        
        List<Customer> customers = customerRepository.findByPhone(cleanPhone);
        if (customers.isEmpty()) {
            return "Welcome to StockPilot! You are not currently registered in our system. Please contact our sales team to open an account.";
        }

        Customer customer = customers.get(0);
        String query = body.trim().toLowerCase();

        // Basic NLP / command parsing
        if (query.startsWith("stock") || query.startsWith("price") || query.contains("do you have")) {
            String searchString = query.replace("stock", "").replace("price", "").replace("do you have", "").replace("?", "").trim();
            
            if (searchString.length() < 3) {
                return "Please provide a more specific part name or number. (e.g., 'stock 5W-30 oil')";
            }

            // Perform a global search on products (ignoring branch/business for this demo logic, but could be scoped)
            List<Product> matches = productRepository.searchProducts(searchString);
            
            if (matches.isEmpty()) {
                return "Sorry " + customer.getName() + ", we couldn't find any products matching '" + searchString + "'.";
            }

            StringBuilder reply = new StringBuilder("Hi " + customer.getName() + ", here is what we found:\n\n");
            for (int i = 0; i < Math.min(matches.size(), 3); i++) {
                Product p = matches.get(i);
                reply.append(String.format("🔧 *%s* (Part: %s)\n", p.getName(), p.getPartNumber()));
                reply.append(String.format("   Stock: %d units\n", p.getQuantity()));
                reply.append(String.format("   Price: ₹%.2f\n\n", p.getPrice()));
            }

            if (matches.size() > 3) {
                reply.append("...and ").append(matches.size() - 3).append(" more matching items.\n");
            }
            return reply.toString();
        } else if (query.equals("hi") || query.equals("hello")) {
            return "Hello " + customer.getName() + "! You can ask me about stock availability by typing: 'stock [part name]'.";
        }

        return "I didn't quite catch that. You can ask me about stock availability by typing: 'stock [part name]'.";
    }
}
