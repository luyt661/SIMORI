package com.example.shimori.repository;

import com.example.shimori.entity.StoneSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoneSettingRepository extends JpaRepository<StoneSetting, Long> {
    List<StoneSetting> findByActiveTrue();
}
