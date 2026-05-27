package com.example.shimori.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_designs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDesign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne
    @JoinColumn(name = "gemstone_id")
    private Gemstone gemstone;

    @ManyToOne
    @JoinColumn(name = "setting_id")
    private StoneSetting setting;

    @ManyToOne
    @JoinColumn(name = "band_style_id")
    private BandStyle bandStyle;

    @ManyToOne
    @JoinColumn(name = "lighting_environment_id")
    private LightingEnvironment lightingEnvironment;

    @Column(name = "ring_size")
    private String ringSize;

    @Column(name = "band_width")
    private BigDecimal bandWidth;

    @Column(name = "gemstone_carat")
    private BigDecimal gemstoneCarat;

    @Column(name = "engraving_text")
    private String engravingText;

    @Column(name = "engraving_price")
    private BigDecimal engravingPrice;

    @Column(name = "configuration_json")
    private String configurationJson;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}