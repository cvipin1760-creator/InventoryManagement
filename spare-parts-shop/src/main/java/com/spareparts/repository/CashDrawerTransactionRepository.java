package com.spareparts.repository;

import com.spareparts.model.CashDrawerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CashDrawerTransactionRepository extends JpaRepository<CashDrawerTransaction, Long> {
    List<CashDrawerTransaction> findByShiftIdOrderByTimestampDesc(Long shiftId);
}
