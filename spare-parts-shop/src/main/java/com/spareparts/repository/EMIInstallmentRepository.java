
package com.spareparts.repository;

import com.spareparts.model.EMIInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EMIInstallmentRepository extends JpaRepository<EMIInstallment, Long> {
    List<EMIInstallment> findByEmiId(Long emiId);
    List<EMIInstallment> findByBusinessId(Long businessId);
    List<EMIInstallment> findByCustomerId(Long customerId);
}
