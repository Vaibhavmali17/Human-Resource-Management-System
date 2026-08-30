package com.hrm.backend.config;

import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.RoleName;
import com.hrm.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed ROLE_ADMIN if not already present
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            Role adminRole = Role.builder()
                    .name(RoleName.ROLE_ADMIN)
                    .build();
            roleRepository.save(adminRole);
            System.out.println("Seeded ROLE_ADMIN database entry successfully.");
        }

        // Seed ROLE_EMPLOYEE if not already present
        if (roleRepository.findByName(RoleName.ROLE_EMPLOYEE).isEmpty()) {
            Role employeeRole = Role.builder()
                    .name(RoleName.ROLE_EMPLOYEE)
                    .build();
            roleRepository.save(employeeRole);
            System.out.println("Seeded ROLE_EMPLOYEE database entry successfully.");
        }
    }
}
