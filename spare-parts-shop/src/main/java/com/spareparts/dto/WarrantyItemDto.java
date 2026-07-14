
package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyItemDto {
    private Long productId;
    private String serialNumber;
    private String modelNumber;
    private String warrantyType;
    private Integer warrantyPeriodMonths;
    private LocalDate warrantyStartDate;
    private String warrantyNotes;
    private String warrantyTerms;
}
