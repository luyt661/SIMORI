package com.example.shimori.controller;

import com.example.shimori.dto.resquest.DesignRequest;
import com.example.shimori.entity.User;
import com.example.shimori.entity.UserDesign;
import com.example.shimori.service.CurrentUserService;
import com.example.shimori.service.DesignService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designs")
@RequiredArgsConstructor
@CrossOrigin
public class DesignController {

    private final DesignService designService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public UserDesign createDraft(
            @RequestBody DesignRequest request,
            HttpServletRequest httpRequest
    ) {
        User user = currentUserService.getCurrentUser(httpRequest);
        return designService.createDraft(user, request);
    }

    @PatchMapping("/{id}")
    public UserDesign autosave(
            @PathVariable Long id,
            @RequestBody DesignRequest request,
            HttpServletRequest httpRequest
    ) {
        User user = currentUserService.getCurrentUser(httpRequest);
        return designService.autosave(id, user, request);
    }

    @GetMapping("/{id}")
    public UserDesign getDesign(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        User user = currentUserService.getCurrentUser(httpRequest);
        return designService.getDesign(id, user);
    }

    @GetMapping("/my-drafts")
    public List<UserDesign> getMyDrafts(HttpServletRequest httpRequest) {
        User user = currentUserService.getCurrentUser(httpRequest);
        return designService.getMyDrafts(user);
    }
}
