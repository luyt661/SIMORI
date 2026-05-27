package com.example.shimori.dto.resquest;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DesignRequest {

    private Long productId;
    private Long materialId;
    private Long gemstoneId;
    private Long settingId;
    private Long bandStyleId;
    private Long lightingEnvironmentId;

    private String ringSize;
    private BigDecimal bandWidth;
    private BigDecimal gemstoneCarat;

    private String engravingText;
    private BigDecimal engravingPrice;

    private String configurationJson;

    private BigDecimal totalPrice;
    private String previewImageUrl;
}
