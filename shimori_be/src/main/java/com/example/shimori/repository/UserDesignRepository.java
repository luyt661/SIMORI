package com.example.shimori.repository;

import com.example.shimori.entity.UserDesign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDesignRepository extends JpaRepository<UserDesign, Long> {
    List<UserDesign> findByUserIdAndStatus(Long userId, String status);
}
