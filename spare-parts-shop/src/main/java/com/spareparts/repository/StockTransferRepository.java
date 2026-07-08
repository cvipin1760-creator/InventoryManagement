package com.spareparts.repository;

import com.spareparts.model.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    List<StockTransfer> findByBusinessId(Long businessId);
    List<StockTransfer> findBySourceBranchId(Long sourceBranchId);
    List<StockTransfer> findByDestinationBranchId(Long destinationBranchId);
}
