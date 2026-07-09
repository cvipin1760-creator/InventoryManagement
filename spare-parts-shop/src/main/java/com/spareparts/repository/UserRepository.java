package com.spareparts.repository;

import com.spareparts.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByBusinessId(Long businessId);
    List<User> findByBusinessIdAndRole(Long businessId, String role);
    List<User> findByRole(String role);
}