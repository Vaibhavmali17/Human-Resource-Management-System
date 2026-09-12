package com.hrm.backend.config;

import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.RoleName;
import com.hrm.backend.entity.User;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository,
                                RoleRepository roleRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("Vaibhav Admin")) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build()));

            User adminUser = User.builder()
                    .username("Vaibhav Admin")
                    .password(passwordEncoder.encode("vaibhav2026"))
                    .email("vaibhav.hr@example.com")
                    .firstName("Vaibhav")
                    .lastName("Admin")
                    .enabled(true)
                    .mustChangePassword(false)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(adminUser);
            logger.info("Admin account 'Vaibhav Admin' initialized successfully.");
        }
    }
}
