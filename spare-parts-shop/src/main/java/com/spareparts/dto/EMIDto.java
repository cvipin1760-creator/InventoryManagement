
package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EMIDto {
    private Double downPayment;
    private Integer totalEmis;
    private Double interestRate;
    private LocalDate firstEmiDate;
    private Double processingFee;
    private String emiNotes;
}
