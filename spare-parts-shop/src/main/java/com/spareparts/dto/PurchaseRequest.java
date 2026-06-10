package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {
    private Long supplierId;
    private List<PurchaseItemRequest> items;
    private Double discount;
    private String gstType;
    private String attachmentPath;
}
