package com.hrm.backend.config;

import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.RoleName;
import com.hrm.backend.entity.User;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS duration_days DOUBLE PRECISION DEFAULT 1.0"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS from_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS to_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS start_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS end_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_type_id BIGINT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_remarks TEXT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reason TEXT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'"); } catch (Exception ignored) {}

        try { jdbcTemplate.execute("ALTER TABLE leave_requests ALTER COLUMN start_date DROP NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ALTER COLUMN end_date DROP NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ALTER COLUMN from_date DROP NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ALTER COLUMN to_date DROP NOT NULL"); } catch (Exception ignored) {}

        try { jdbcTemplate.execute("UPDATE leave_requests SET start_date = from_date WHERE start_date IS NULL AND from_date IS NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET end_date = to_date WHERE end_date IS NULL AND to_date IS NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET from_date = start_date WHERE from_date IS NULL AND start_date IS NOT NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET to_date = end_date WHERE to_date IS NULL AND end_date IS NOT NULL"); } catch (Exception ignored) {}

        try { jdbcTemplate.execute("INSERT INTO leave_types (name, default_days_per_year) VALUES ('Casual Leave', 12.0), ('Sick Leave', 10.0), ('Annual Leave', 15.0) ON CONFLICT DO NOTHING"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET leave_type_id = (SELECT id FROM leave_types ORDER BY id ASC LIMIT 1) WHERE leave_type_id IS NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_balances SET leave_type_id = (SELECT id FROM leave_types ORDER BY id ASC LIMIT 1) WHERE leave_type_id IS NULL"); } catch (Exception ignored) {}


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

        // Seed default admin account if not already present
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(new BCryptPasswordEncoder().encode("admin123"));
            
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
            adminUser.setRoles(Set.of(adminRole));
            User savedAdmin = userRepository.save(adminUser);

            Employee employee = new Employee();
            employee.setUser(savedAdmin);
            employee.setFirstName("Admin");
            employee.setLastName("User");
            employee.setEmail("admin@company.com");
            employee.setDepartment("Administration");
            employee.setDesignation("HR Admin");
            employee.setPhoneNumber("");
            employee.setDateOfJoining(java.time.LocalDate.now());
            employee.setSalary(0.0);
            employeeRepository.save(employee);
            
            System.out.println("Seeded default admin user and minimal employee profile successfully.");
        }
    }
}
