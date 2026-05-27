package com.example.shimori.repository;

import com.example.shimori.entity.BandStyle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BandStyleRepository extends JpaRepository<BandStyle, Long> {
    List<BandStyle> findByActiveTrue();
}
