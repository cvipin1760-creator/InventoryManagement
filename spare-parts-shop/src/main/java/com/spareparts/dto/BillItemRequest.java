package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillItemRequest {
    private Long productId;
    private Integer quantity;
    private Double price;
    private Double gstPercent;
    private Double discount;
}