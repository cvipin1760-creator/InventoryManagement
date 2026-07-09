package com.spareparts.service;

import com.spareparts.model.Product;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.spareparts.Config.InventoryWebSocketHandler;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;

    @Autowired
    private InventoryWebSocketHandler inventoryWebSocketHandler;

    public Page<Product> getAllProducts(Pageable pageable) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return productRepository.findByBusinessId(businessId, branchId, pageable);
    }
    
    public Product getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        com.spareparts.config.TenantSecurity.checkAccess(product);
        return product;
    }
    
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public Product createProduct(Product product) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));
        product.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            product.setBranch(branch);
        }

        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);
        broadcastUpdate(businessId, saved);
        return saved;
    }

    private void broadcastUpdate(Long businessId, Product product) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "INVENTORY_UPDATE");
        payload.put("product", product);
        inventoryWebSocketHandler.broadcastInventoryUpdate(businessId, payload);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id); // Already validates tenant
        product.setName(productDetails.getName());
        product.setPartNumber(productDetails.getPartNumber());
        product.setCostPrice(productDetails.getCostPrice());
        product.setPrice(productDetails.getPrice());
        product.setGstPercent(productDetails.getGstPercent());
        product.setQuantity(productDetails.getQuantity());
        product.setLowStockThreshold(productDetails.getLowStockThreshold());
        product.setAttachmentPath(productDetails.getAttachmentPath());
        product.setUpdatedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);
        broadcastUpdate(saved.getBusiness().getId(), saved);
        return saved;
    }
    
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public void deleteProduct(Long id) {
        Product product = getProductById(id); // Already validates tenant
        productRepository.delete(product);
    }
    
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return productRepository.searchProducts(keyword, businessId, branchId, pageable);
    }
    
    public Page<Product> getLowStockProducts(Pageable pageable) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return productRepository.findLowStockProducts(businessId, branchId, pageable);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public List<Product> uploadFromExcel(MultipartFile file) throws IOException {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        Branch branch = null;
        if (branchId != null) {
            branch = branchRepository.findById(branchId).orElse(null);
        }

        List<Product> products = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;
                
                try {
                    String partNumber = getCellValue(row.getCell(1));
                    if (partNumber.isEmpty()) {
                        throw new RuntimeException("Part number is missing");
                    }
                    
                    // Check if product already exists by part number and business ID
                    Product product = productRepository.findByPartNumberAndBusinessId(partNumber, businessId, branchId)
                            .orElse(new Product());
                    
                    product.setName(getCellValue(row.getCell(0)));
                    product.setPartNumber(partNumber);
                    
                    String costPriceStr = getCellValue(row.getCell(2));
                    product.setCostPrice(costPriceStr.isEmpty() ? 0.0 : Double.parseDouble(costPriceStr));
                    
                    String priceStr = getCellValue(row.getCell(3));
                    product.setPrice(priceStr.isEmpty() ? 0.0 : Double.parseDouble(priceStr));
                    
                    String gstStr = getCellValue(row.getCell(4));
                    product.setGstPercent(gstStr.isEmpty() ? 0.0 : Double.parseDouble(gstStr));
                    
                    String qtyStr = getCellValue(row.getCell(5));
                    if (qtyStr.isEmpty()) {
                        product.setQuantity(0);
                    } else {
                        // Handle potential decimals from numeric cells like "50.0"
                        double qtyDouble = Double.parseDouble(qtyStr);
                        product.setQuantity((int) qtyDouble);
                    }
                    
                    if (product.getId() == null) {
                        product.setBusiness(business);
                        if (branch != null) {
                            product.setBranch(branch);
                        }
                        product.setLowStockThreshold(10);
                        product.setCreatedAt(LocalDateTime.now());
                    }
                    product.setUpdatedAt(LocalDateTime.now());
                    
                    Product saved = productRepository.save(product);
                    products.add(saved);
                    broadcastUpdate(businessId, saved);
                } catch (Exception e) {
                    throw new RuntimeException("Error in row " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        return products;
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                // Avoid scientific notation for large numbers
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return String.valueOf(cell.getNumericCellValue());
            default:
                return "";
        }
    }
    
    public Workbook exportToExcel() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        List<Product> products = productRepository.findByBusinessId(businessId, branchId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Products");
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Name", "Part Number", "Cost Price", "Selling Price", "GST %", "Quantity", "Low Stock Threshold"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        int rowNum = 1;
        for (Product product : products) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getName());
            row.createCell(1).setCellValue(product.getPartNumber());
            row.createCell(2).setCellValue(product.getCostPrice() != null ? product.getCostPrice() : 0.0);
            row.createCell(3).setCellValue(product.getPrice());
            row.createCell(4).setCellValue(product.getGstPercent());
            row.createCell(5).setCellValue(product.getQuantity());
            row.createCell(6).setCellValue(product.getLowStockThreshold());
        }
        
        return workbook;
    }
}
