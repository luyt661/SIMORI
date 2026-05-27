package com.example.shimori.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;

    private String description;

    @Column(name = "base_price")
    private BigDecimal basePrice;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "model_url")
    private String modelUrl;

    private String category;

    @Column(name = "is_customizable")
    private Boolean customizable;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}