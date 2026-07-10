package com.spareparts.service;

import com.spareparts.dto.PurchaseOrderRequest;
import com.spareparts.model.Product;
import com.spareparts.model.Supplier;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastingService {
    private final ProductRepository productRepository;
    private final BillRepository billRepository;
    private final PurchaseOrderService purchaseOrderService;
    private final SupplierRepository supplierRepository;

    public Integer calculate30DayRunRate(Long productId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        Integer soldQuantity = billRepository.getTotalQuantitySoldForProduct(productId, thirtyDaysAgo, now);
        return soldQuantity;
    }

    public Integer predictDaysUntilStockout(Long productId, Integer currentQuantity) {
        Integer runRate = calculate30DayRunRate(productId);
        if (runRate == 0) return 999; // No sales recently, basically infinite
        
        double dailyRunRate = runRate / 30.0;
        return (int) (currentQuantity / dailyRunRate);
    }

    /**
     * Runs every day at 2:00 AM to check for products that need restocking.
     * Generates a DRAFT Purchase Order if any products are low or predicted to stock out soon.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void generateSmartPurchaseOrders() {
        log.info("Starting AI Demand Forecasting and Smart PO Generation...");
        
        List<Product> allProducts = productRepository.findAll();
        // Group items that need ordering by their supplier
        Map<Supplier, List<PurchaseOrderRequest.PurchaseOrderItemRequest>> itemsBySupplier = new HashMap<>();

        for (Product product : allProducts) {
            boolean needsReorder = false;
            String reason = "";
            
            // 1. Check strict threshold
            if (product.getQuantity() <= product.getLowStockThreshold()) {
                needsReorder = true;
                reason = "Current stock (" + product.getQuantity() + ") is at or below threshold (" + product.getLowStockThreshold() + ")";
            } 
            // 2. Check predictive forecast (Stock out in < 7 days)
            else {
                int daysUntilStockout = predictDaysUntilStockout(product.getId(), product.getQuantity());
                if (daysUntilStockout <= 7) {
                    needsReorder = true;
                    reason = "AI Forecast: Likely to stock out in " + daysUntilStockout + " days based on 30-day run rate";
                }
            }

            if (needsReorder) {
                // If the product doesn't have a supplier set, we can't auto-PO it. 
                // We'll just grab the first supplier for demonstration, but in reality, Product should have a primary supplier.
                List<Supplier> suppliers = supplierRepository.findByBusinessId(product.getBusiness().getId(), null);
                if (suppliers.isEmpty()) continue;
                
                Supplier targetSupplier = suppliers.get(0); // Use the first supplier as the default for this phase
                
                PurchaseOrderRequest.PurchaseOrderItemRequest itemReq = new PurchaseOrderRequest.PurchaseOrderItemRequest();
                itemReq.setProductId(product.getId());
                
                // Smart Reorder Quantity: Order enough to last 30 days based on run rate
                int runRate30 = calculate30DayRunRate(product.getId());
                int orderQuantity = runRate30 > 0 ? runRate30 : 10; // Default to 10 if no history
                
                // Ensure we order at least up to the low stock threshold + 5
                if (orderQuantity < product.getLowStockThreshold()) {
                    orderQuantity = product.getLowStockThreshold() + 10;
                }
                
                itemReq.setQuantity(orderQuantity);
                itemReq.setEstimatedPrice(product.getPrice()); // Ideally this would be cost price
                itemReq.setSuggestedByAi(true);
                itemReq.setReason(reason);

                itemsBySupplier.computeIfAbsent(targetSupplier, k -> new ArrayList<>()).add(itemReq);
            }
        }

        // Generate POs for each supplier
        for (Map.Entry<Supplier, List<PurchaseOrderRequest.PurchaseOrderItemRequest>> entry : itemsBySupplier.entrySet()) {
            Supplier supplier = entry.getKey();
            List<PurchaseOrderRequest.PurchaseOrderItemRequest> items = entry.getValue();

            PurchaseOrderRequest poRequest = new PurchaseOrderRequest();
            poRequest.setSupplierId(supplier.getId());
            poRequest.setStatus("DRAFT");
            poRequest.setIsAutoGenerated(true);
            poRequest.setExpectedDate(LocalDateTime.now().plusDays(7));
            poRequest.setNotes("AI Auto-Generated Draft based on Demand Forecasting");
            poRequest.setItems(items);

            // In a real environment, we must mock the TenantContext for async scheduled tasks.
            // But since this is a demonstration, we will rely on a custom bypass in the Service or mock it.
            // Note: Since TenantContext uses ThreadLocal, @Scheduled will throw errors inside the Service.
            // So we need to ensure the Service handles system-level operations or we mock the context.
            // We pass the businessId explicitly to the system creation method.
            Long businessId = items.get(0).getProductId(); // wait, we need businessId
            // Better way: get the businessId from the supplier
            Long targetBusinessId = supplier.getBusiness().getId();
            
            try {
                purchaseOrderService.createSystemPurchaseOrder(poRequest, targetBusinessId);
                log.info("Successfully generated AI Purchase Order for Supplier: {}", supplier.getName());
            } catch (Exception e) {
                log.error("Failed to generate system PO for supplier: {}", supplier.getName(), e);
            }
        }
        
        log.info("Finished Smart PO Generation.");
    }
}
