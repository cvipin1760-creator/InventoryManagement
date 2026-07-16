package com.spareparts.service;

import com.spareparts.model.BillingCounter;
import com.spareparts.model.QueueEntry;
import com.spareparts.model.User;
import com.spareparts.Config.QueueWebSocketHandler;
import com.spareparts.repository.BillingCounterRepository;
import com.spareparts.repository.QueueEntryRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class QueueService {

    @Autowired
    private BillingCounterRepository billingCounterRepository;

    @Autowired
    private QueueEntryRepository queueEntryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QueueWebSocketHandler queueWebSocketHandler;

    public BillingCounter createCounter(String name) {
        BillingCounter counter = new BillingCounter();
        counter.setBusinessId(TenantContext.getCurrentBusinessId());
        counter.setName(name);
        counter.setStatus("CLOSED");
        return billingCounterRepository.save(counter);
    }
    
    public List<BillingCounter> getCounters() {
        return billingCounterRepository.findByBusinessId(TenantContext.getCurrentBusinessId());
    }

    public BillingCounter assignCashierToCounter(Long counterId, Long cashierId) {
        BillingCounter counter = billingCounterRepository.findByIdAndBusinessId(counterId, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Counter not found"));
                
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));
                
        counter.setCurrentCashier(cashier);
        counter.setStatus("OPEN");
        BillingCounter saved = billingCounterRepository.save(counter);
        queueWebSocketHandler.broadcastUpdate(counter.getBusinessId(), Map.of("type", "COUNTER_UPDATED"));
        return saved;
    }
    
    public BillingCounter closeCounter(Long counterId) {
        BillingCounter counter = billingCounterRepository.findByIdAndBusinessId(counterId, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        counter.setCurrentCashier(null);
        counter.setStatus("CLOSED");
        BillingCounter saved = billingCounterRepository.save(counter);
        queueWebSocketHandler.broadcastUpdate(counter.getBusinessId(), Map.of("type", "COUNTER_UPDATED"));
        return saved;
    }

    public QueueEntry joinQueue(Long counterId, String customerName) {
        BillingCounter counter = billingCounterRepository.findByIdAndBusinessId(counterId, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        if (!"OPEN".equals(counter.getStatus())) {
            throw new RuntimeException("Cannot join a closed counter");
        }

        QueueEntry entry = new QueueEntry();
        entry.setBusinessId(TenantContext.getCurrentBusinessId());
        entry.setBillingCounter(counter);
        entry.setCustomerName(customerName);
        entry.setTokenNumber(UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        entry.setStatus("WAITING");
        entry.setJoinTime(LocalDateTime.now());

        // Estimate wait time based on queue length (e.g. 2 minutes per person)
        long currentQueueLength = queueEntryRepository.findByBillingCounterIdAndStatusOrderByJoinTimeAsc(counterId, "WAITING").size();
        entry.setEstimatedWaitTimeMinutes((int) (currentQueueLength * 2));

        QueueEntry saved = queueEntryRepository.save(entry);
        queueWebSocketHandler.broadcastUpdate(counter.getBusinessId(), Map.of("type", "QUEUE_UPDATED", "counterId", counterId));
        return saved;
    }
    
    public List<QueueEntry> getQueueForCounter(Long counterId) {
        return queueEntryRepository.findByBillingCounterIdAndStatusOrderByJoinTimeAsc(counterId, "WAITING");
    }

    public QueueEntry serveNext(Long counterId) {
        List<QueueEntry> queue = queueEntryRepository.findByBillingCounterIdAndStatusOrderByJoinTimeAsc(counterId, "WAITING");
        if (queue.isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        
        QueueEntry next = queue.get(0);
        next.setStatus("SERVING");
        next.setServiceTime(LocalDateTime.now());
        QueueEntry saved = queueEntryRepository.save(next);
        queueWebSocketHandler.broadcastUpdate(TenantContext.getCurrentBusinessId(), Map.of("type", "QUEUE_UPDATED", "counterId", counterId));
        return saved;
    }
    
    public QueueEntry completeService(Long queueId) {
        QueueEntry entry = queueEntryRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        entry.setStatus("COMPLETED");
        QueueEntry saved = queueEntryRepository.save(entry);
        queueWebSocketHandler.broadcastUpdate(TenantContext.getCurrentBusinessId(), Map.of("type", "QUEUE_UPDATED", "counterId", entry.getBillingCounter().getId()));
        return saved;
    }
}
