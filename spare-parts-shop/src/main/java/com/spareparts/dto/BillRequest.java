package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillRequest {
    private Long customerId;
    private List<BillItemRequest> items;
    private Double discount;
    private String gstType;
    private Double paidAmount;
}
