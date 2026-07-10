package com.spareparts.repository;

import com.spareparts.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<PurchaseOrder> findByBusinessIdAndBranchIdOrderByCreatedAtDesc(Long businessId, Long branchId);
}
