package com.spareparts.repository;

import com.spareparts.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByBusinessId(Long businessId);
    List<SupportTicket> findByCustomerId(Long customerId);
    List<SupportTicket> findByBusinessIdAndStatus(Long businessId, String status);
}
