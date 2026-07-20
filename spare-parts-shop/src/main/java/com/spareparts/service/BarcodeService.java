package com.spareparts.service;

import com.spareparts.config.TenantContext;
import com.spareparts.model.BarcodePrintHistory;
import com.spareparts.model.BarcodeTemplate;
import com.spareparts.model.Business;
import com.spareparts.model.Product;
import com.spareparts.model.User;
import com.spareparts.repository.BarcodePrintHistoryRepository;
import com.spareparts.repository.BarcodeTemplateRepository;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BarcodeService {

    private final ProductRepository productRepository;
    private final BarcodeTemplateRepository barcodeTemplateRepository;
    private final BarcodePrintHistoryRepository barcodePrintHistoryRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public List<BarcodeTemplate> getTemplates() {
        return barcodeTemplateRepository.findByBusinessId(TenantContext.getBusinessId());
    }

    @Transactional
    public BarcodeTemplate saveTemplate(BarcodeTemplate template) {
        Business business = businessRepository.findById(TenantContext.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
        template.setBusiness(business);
        return barcodeTemplateRepository.save(template);
    }

    @Transactional
    public Product generateBarcodeForProduct(Long productId) {
        Product product = productRepository.findByIdAndBusinessId(productId, TenantContext.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getBarcode() == null || product.getBarcode().isBlank()) {
            // Generate EAN-13 style or custom 12-digit code
            String prefix = String.format("%03d", product.getBusiness().getId());
            String suffix = String.format("%06d", product.getId());
            // simplistic auto-generation logic
            String barcode = prefix + "000" + suffix;
            product.setBarcode(barcode);
            
            if (product.getSku() == null || product.getSku().isBlank()) {
                product.setSku("SKU-" + product.getId());
            }
            return productRepository.save(product);
        }
        return product;
    }

    @Transactional
    public int generateMissingBarcodes() {
        Long businessId = TenantContext.getBusinessId();
        List<Product> products = productRepository.findByBusinessId(businessId);
        int generatedCount = 0;

        for (Product product : products) {
            if (product.getBarcode() == null || product.getBarcode().isBlank()) {
                String prefix = String.format("%03d", businessId);
                String suffix = String.format("%06d", product.getId());
                product.setBarcode(prefix + "000" + suffix);
                
                if (product.getSku() == null || product.getSku().isBlank()) {
                    product.setSku("SKU-" + product.getId());
                }
                productRepository.save(product);
                generatedCount++;
            }
        }
        return generatedCount;
    }

    @Transactional
    public void recordPrintHistory(Long productId, Integer copies, String templateUsed, Long userId) {
        Product product = productRepository.findByIdAndBusinessId(productId, TenantContext.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BarcodePrintHistory history = new BarcodePrintHistory();
        history.setBusiness(product.getBusiness());
        history.setProduct(product);
        history.setPrintedBy(user);
        history.setCopies(copies);
        history.setTemplateUsed(templateUsed);
        
        barcodePrintHistoryRepository.save(history);
    }

    public Page<BarcodePrintHistory> getPrintHistory(Pageable pageable) {
        return barcodePrintHistoryRepository.findByBusinessIdOrderByPrintDateDesc(
                TenantContext.getBusinessId(), pageable);
    }
}
