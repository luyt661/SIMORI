package com.example.shimori.repository;

import com.example.shimori.entity.User;
import com.example.shimori.entity.UserDesign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDesignRepository extends JpaRepository<UserDesign, Long> {
    List<UserDesign> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, String status);
}
