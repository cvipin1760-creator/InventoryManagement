package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerBalance {
    private Long customerId;
    private Double totalBilled;
    private Double totalPaid;
    private Double remainingAmount;
}
