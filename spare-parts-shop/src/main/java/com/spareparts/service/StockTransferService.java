package com.spareparts.service;

import com.spareparts.dto.StockTransferRequest;
import com.spareparts.model.Branch;
import com.spareparts.model.Business;
import com.spareparts.model.Product;
import com.spareparts.model.StockTransfer;
import com.spareparts.model.User;
import com.spareparts.repository.BranchRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.StockTransferRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.spareparts.config.InventoryWebSocketHandler;

@Service
public class StockTransferService {

    @Autowired
    private StockTransferRepository stockTransferRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryWebSocketHandler inventoryWebSocketHandler;

    private void broadcastUpdate(Long businessId, Product product) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "INVENTORY_UPDATE");
        payload.put("product", product);
        inventoryWebSocketHandler.broadcastInventoryUpdate(businessId, payload);
    }

    public List<StockTransfer> getTransfersByBusiness(Long businessId) {
        return stockTransferRepository.findByBusinessId(businessId);
    }

    @Transactional
    public StockTransfer createTransfer(Long userId, StockTransferRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = user.getBusiness();
        if (business == null) {
            throw new RuntimeException("User is not associated with any business");
        }

        Branch sourceBranch = branchRepository.findById(request.getSourceBranchId())
                .orElseThrow(() -> new RuntimeException("Source branch not found"));

        Branch destBranch = branchRepository.findById(request.getDestinationBranchId())
                .orElseThrow(() -> new RuntimeException("Destination branch not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!sourceBranch.getBusiness().getId().equals(business.getId()) ||
            !destBranch.getBusiness().getId().equals(business.getId()) ||
            !product.getBusiness().getId().equals(business.getId())) {
            throw new RuntimeException("Unauthorized transfer");
        }

        if (product.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock in source branch (assuming global product stock is per branch for now)");
        }

        // Subtract stock from source immediately (we might want a BranchProduct mapping later,
        // but for now we reduce global stock and increase it later, or just keep it PENDING)
        // In a real multi-branch setup, Product entity would have stock per branch. 
        // For this demo, let's deduct the stock on creation and add it back if cancelled.
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);
        broadcastUpdate(business.getId(), product);

        StockTransfer transfer = new StockTransfer();
        transfer.setBusiness(business);
        transfer.setSourceBranch(sourceBranch);
        transfer.setDestinationBranch(destBranch);
        transfer.setProduct(product);
        transfer.setQuantity(request.getQuantity());
        transfer.setNotes(request.getNotes());
        transfer.setStatus("PENDING");

        return stockTransferRepository.save(transfer);
    }

    @Transactional
    public StockTransfer updateTransferStatus(Long userId, Long transferId, String newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        if (!transfer.getBusiness().getId().equals(user.getBusiness().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (transfer.getStatus().equals("COMPLETED") || transfer.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Transfer is already " + transfer.getStatus());
        }

        if (newStatus.equals("COMPLETED")) {
            // Add stock to destination branch. 
            // In a simple model where product stock is global, transferring means moving stock.
            // If stock is global, transferring does not change global stock sum. We should restore the deducted stock.
            Product product = transfer.getProduct();
            product.setQuantity(product.getQuantity() + transfer.getQuantity());
            productRepository.save(product);
            broadcastUpdate(transfer.getBusiness().getId(), product);
        } else if (newStatus.equals("CANCELLED")) {
            // Restore stock to source branch (which is just global stock)
            Product product = transfer.getProduct();
            product.setQuantity(product.getQuantity() + transfer.getQuantity());
            productRepository.save(product);
            broadcastUpdate(transfer.getBusiness().getId(), product);
        }

        transfer.setStatus(newStatus);
        return stockTransferRepository.save(transfer);
    }
}
