package com.spareparts.repository;

import com.spareparts.model.BarcodePrintHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarcodePrintHistoryRepository extends JpaRepository<BarcodePrintHistory, Long> {
    Page<BarcodePrintHistory> findByBusinessIdOrderByPrintDateDesc(Long businessId, Pageable pageable);
}
