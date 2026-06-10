package com.spareparts.service;

import com.spareparts.model.Product;
import com.spareparts.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
    
    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setPartNumber(productDetails.getPartNumber());
        product.setCostPrice(productDetails.getCostPrice());
        product.setPrice(productDetails.getPrice());
        product.setGstPercent(productDetails.getGstPercent());
        product.setQuantity(productDetails.getQuantity());
        product.setLowStockThreshold(productDetails.getLowStockThreshold());
        product.setAttachmentPath(productDetails.getAttachmentPath());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }
    
    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
    
    public List<Product> uploadFromExcel(MultipartFile file) throws IOException {
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
                    
                    // Check if product already exists by part number
                    Product product = productRepository.findByPartNumber(partNumber)
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
                        product.setLowStockThreshold(10);
                        product.setCreatedAt(LocalDateTime.now());
                    }
                    product.setUpdatedAt(LocalDateTime.now());
                    
                    products.add(productRepository.save(product));
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
        List<Product> products = productRepository.findAll();
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