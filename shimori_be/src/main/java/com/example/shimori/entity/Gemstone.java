package com.example.shimori.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gemstones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gemstone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;

    private BigDecimal price;

    private String color;

    @Column(name = "model_url")
    private String modelUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    private String description;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}