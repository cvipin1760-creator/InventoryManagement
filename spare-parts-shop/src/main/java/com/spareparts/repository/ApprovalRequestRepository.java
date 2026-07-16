package com.spareparts.repository;

import com.spareparts.model.ManagerApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ManagerApprovalRequest, Long> {
    List<ManagerApprovalRequest> findByBusinessIdAndStatusOrderByRequestedAtDesc(Long businessId, String status);
    Optional<ManagerApprovalRequest> findByIdAndBusinessId(Long id, Long businessId);
}
