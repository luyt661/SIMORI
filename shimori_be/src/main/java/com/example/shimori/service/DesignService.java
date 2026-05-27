package com.example.shimori.service;

import com.example.shimori.dto.resquest.DesignRequest;
import com.example.shimori.entity.*;
import com.example.shimori.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignService {

    private final UserDesignRepository userDesignRepository;
    private final ProductRepository productRepository;
    private final MaterialRepository materialRepository;
    private final GemstoneRepository gemstoneRepository;
    private final StoneSettingRepository stoneSettingRepository;
    private final BandStyleRepository bandStyleRepository;
    private final LightingEnvironmentRepository lightingEnvironmentRepository;

    public UserDesign createDraft(User user, DesignRequest request) {
        UserDesign design = UserDesign.builder()
                .user(user)
                .product(findProduct(request.getProductId()))
                .material(findMaterial(request.getMaterialId()))
                .gemstone(findGemstone(request.getGemstoneId()))
                .setting(findSetting(request.getSettingId()))
                .bandStyle(findBandStyle(request.getBandStyleId()))
                .lightingEnvironment(findLighting(request.getLightingEnvironmentId()))
                .ringSize(request.getRingSize())
                .bandWidth(request.getBandWidth())
                .gemstoneCarat(request.getGemstoneCarat())
                .engravingText(request.getEngravingText())
                .engravingPrice(request.getEngravingPrice())
                .configurationJson(request.getConfigurationJson())
                .totalPrice(request.getTotalPrice())
                .previewImageUrl(request.getPreviewImageUrl())
                .status("DRAFT")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userDesignRepository.save(design);
    }

    public UserDesign autosave(Long designId, User user, DesignRequest request) {
        UserDesign design = userDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));

        if (!design.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this design");
        }

        if (request.getProductId() != null) {
            design.setProduct(findProduct(request.getProductId()));
        }

        if (request.getMaterialId() != null) {
            design.setMaterial(findMaterial(request.getMaterialId()));
        }

        if (request.getGemstoneId() != null) {
            design.setGemstone(findGemstone(request.getGemstoneId()));
        }

        if (request.getSettingId() != null) {
            design.setSetting(findSetting(request.getSettingId()));
        }

        if (request.getBandStyleId() != null) {
            design.setBandStyle(findBandStyle(request.getBandStyleId()));
        }

        if (request.getLightingEnvironmentId() != null) {
            design.setLightingEnvironment(findLighting(request.getLightingEnvironmentId()));
        }

        if (request.getRingSize() != null) {
            design.setRingSize(request.getRingSize());
        }

        if (request.getBandWidth() != null) {
            design.setBandWidth(request.getBandWidth());
        }

        if (request.getGemstoneCarat() != null) {
            design.setGemstoneCarat(request.getGemstoneCarat());
        }

        if (request.getEngravingText() != null) {
            design.setEngravingText(request.getEngravingText());
        }

        if (request.getEngravingPrice() != null) {
            design.setEngravingPrice(request.getEngravingPrice());
        }

        if (request.getConfigurationJson() != null) {
            design.setConfigurationJson(request.getConfigurationJson());
        }

        if (request.getTotalPrice() != null) {
            design.setTotalPrice(request.getTotalPrice());
        }

        if (request.getPreviewImageUrl() != null) {
            design.setPreviewImageUrl(request.getPreviewImageUrl());
        }

        design.setStatus("DRAFT");
        design.setUpdatedAt(LocalDateTime.now());

        return userDesignRepository.save(design);
    }

    public UserDesign getDesign(Long designId, User user) {
        UserDesign design = userDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));

        if (!design.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this design");
        }

        return design;
    }

    public List<UserDesign> getMyDrafts(User user) {
        return userDesignRepository.findByUserIdAndStatus(
                user.getId(),
                "DRAFT"
        );
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private Material findMaterial(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    private Gemstone findGemstone(Long id) {
        return gemstoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gemstone not found"));
    }

    private StoneSetting findSetting(Long id) {
        return stoneSettingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setting not found"));
    }

    private BandStyle findBandStyle(Long id) {
        return bandStyleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Band style not found"));
    }

    private LightingEnvironment findLighting(Long id) {
        if (id == null) return null;

        return lightingEnvironmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lighting environment not found"));
    }
}
