package com.spareparts.dto;

import lombok.Data;
import com.spareparts.model.Product;

@Data
public class FastMovingProductDto {
    private Product product;
    private long totalSold;

    public FastMovingProductDto(Product product, long totalSold) {
        this.product = product;
        this.totalSold = totalSold;
    }
}
