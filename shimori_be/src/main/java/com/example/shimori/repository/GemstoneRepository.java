package com.example.shimori.repository;

import com.example.shimori.entity.Gemstone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GemstoneRepository extends JpaRepository<Gemstone, Long> {
    List<Gemstone> findByActiveTrue();
}
