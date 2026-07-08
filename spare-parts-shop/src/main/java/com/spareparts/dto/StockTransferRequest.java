package com.spareparts.dto;

import lombok.Data;

@Data
public class StockTransferRequest {
    private Long sourceBranchId;
    private Long destinationBranchId;
    private Long productId;
    private Integer quantity;
    private String notes;
}
