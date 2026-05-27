package com.example.shimori.controller;

import com.example.shimori  .repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/configurator")
@RequiredArgsConstructor
@CrossOrigin
public class ConfiguratorController {

    private final MaterialRepository materialRepository;
    private final GemstoneRepository gemstoneRepository;
    private final StoneSettingRepository stoneSettingRepository;
    private final BandStyleRepository bandStyleRepository;
    private final LightingEnvironmentRepository lightingEnvironmentRepository;
    private final ProductRepository productRepository;

    @GetMapping("/options")
    public Map<String, Object> getOptions() {
        return Map.of(
                "products", productRepository.findByActiveTrue(),
                "materials", materialRepository.findByActiveTrue(),
                "gemstones", gemstoneRepository.findByActiveTrue(),
                "settings", stoneSettingRepository.findByActiveTrue(),
                "bandStyles", bandStyleRepository.findByActiveTrue(),
                "lightingEnvironments", lightingEnvironmentRepository.findByActiveTrue()
        );
    }
}
