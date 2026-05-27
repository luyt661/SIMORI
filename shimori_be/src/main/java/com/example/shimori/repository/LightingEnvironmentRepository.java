package com.example.shimori.repository;

import com.example.shimori.entity.LightingEnvironment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LightingEnvironmentRepository extends JpaRepository<LightingEnvironment, Long> {
    List<LightingEnvironment> findByActiveTrue();
}
