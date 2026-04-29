package com.sliit.smartcampus.auth;

import com.sliit.smartcampus.auth.dto.AuthResponse;
import com.sliit.smartcampus.auth.dto.GoogleAuthRequest;
import com.sliit.smartcampus.auth.dto.LoginRequest;
import com.sliit.smartcampus.auth.dto.RegisterRequest;
import com.sliit.smartcampus.auth.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            return ResponseEntity.ok(authService.authenticateWithGoogle(request.credential()));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        AuthResponse.UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        AuthResponse.UserDto updated = authService.updateProfile(userId, request);
        return ResponseEntity.ok(updated);
    }

    private static ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", HttpStatus.FORBIDDEN.value(),
                "error", HttpStatus.FORBIDDEN.getReasonPhrase(),
                "message", message != null ? message : "Forbidden",
                "timestamp", Instant.now().toString()));
    }
}
