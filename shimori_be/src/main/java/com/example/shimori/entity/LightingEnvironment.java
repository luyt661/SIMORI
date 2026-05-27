package com.example.shimori.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lighting_environments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LightingEnvironment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;

    @Column(name = "environment_url")
    private String environmentUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    private Double intensity;

    private String description;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}