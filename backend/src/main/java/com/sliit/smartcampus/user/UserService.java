package com.sliit.smartcampus.user;

import com.sliit.smartcampus.auth.User;
import com.sliit.smartcampus.auth.UserRepository;
import com.sliit.smartcampus.user.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Set<String> VALID_ROLES = Set.of("USER", "TECHNICIAN", "MANAGER", "ADMIN");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    public UserResponse updateRole(Long id, String role) {
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
        userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.updateRole(id, role);
        return getUserById(id);
    }

    public UserResponse toggleActive(Long id, boolean active) {
        userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.updateActiveStatus(id, active);
        return getUserById(id);
    }

    public UserResponse updateUser(Long id, String name, String role, Boolean active) {
        userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (name != null && !name.isBlank()) {
            userRepository.updateName(id, name.trim());
        }
        if (role != null) {
            if (!VALID_ROLES.contains(role)) {
                throw new IllegalArgumentException("Invalid role: " + role);
            }
            userRepository.updateRole(id, role);
        }
        if (active != null) {
            userRepository.updateActiveStatus(id, active);
        }
        return getUserById(id);
    }

    public List<UserResponse> getTechnicians() {
        return userRepository.findByRoles(List.of("TECHNICIAN")).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Permanently removes a user. Admins cannot delete themselves to avoid lockout.
     * If the user is referenced by other records (bookings, tickets, etc.) the
     * underlying foreign-key violation is surfaced by GlobalExceptionHandler as
     * a 409 with a friendly message.
     */
    public void deleteUser(Long actorId, Long targetId) {
        if (actorId != null && actorId.equals(targetId)) {
            throw new IllegalStateException("You cannot delete your own account");
        }
        userRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.deleteById(targetId);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.name(),
                user.profilePicture(),
                user.role(),
                user.isActive(),
                user.createdAt().atOffset(ZoneOffset.UTC).format(DATE_FMT));
    }
}
