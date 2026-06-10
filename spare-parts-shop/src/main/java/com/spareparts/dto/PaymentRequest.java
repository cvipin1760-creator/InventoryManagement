package com.spareparts.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long customerId;
    private Long billId;
    private Double amount;
    private String note;
}
