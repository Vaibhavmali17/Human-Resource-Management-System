package com.hrm.backend.service;

import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;
import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.RoleName;
import com.hrm.backend.entity.User;
import com.hrm.backend.exception.APIException;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.entity.Employee;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           EmployeeRepository employeeRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public String login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return tokenProvider.generateToken(authentication);
    }

    @Override
    public String register(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Username check failed: Username is already taken!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        Set<Role> roles = new HashSet<>();

        String roleStr = signupRequest.getRole();
        if (roleStr != null && roleStr.equalsIgnoreCase("ROLE_ADMIN")) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Admin Role not found."));
            roles.add(adminRole);
        } else {
            Role userRole = roleRepository.findByName(RoleName.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Employee Role not found."));
            roles.add(userRole);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        if (roleStr == null || !roleStr.equalsIgnoreCase("ROLE_ADMIN")) {
            Employee employee = new Employee();
            employee.setUser(savedUser);
            employee.setFirstName(signupRequest.getFirstName() != null ? signupRequest.getFirstName() : signupRequest.getUsername());
            employee.setLastName(signupRequest.getLastName() != null ? signupRequest.getLastName() : "");
            
            String email = signupRequest.getEmail();
            if (email == null || email.trim().isEmpty()) {
                email = signupRequest.getUsername() + "@company.com";
            }
            employee.setEmail(email);
            
            employee.setDepartment(signupRequest.getDepartment() != null ? signupRequest.getDepartment() : "General");
            employee.setDesignation(signupRequest.getDesignation() != null ? signupRequest.getDesignation() : "Associate");
            employee.setPhoneNumber(signupRequest.getPhone() != null ? signupRequest.getPhone() : "");

            if (signupRequest.getDateOfJoining() != null && !signupRequest.getDateOfJoining().trim().isEmpty()) {
                try {
                    employee.setDateOfJoining(java.time.LocalDate.parse(signupRequest.getDateOfJoining().trim()));
                } catch (Exception e) {
                    employee.setDateOfJoining(java.time.LocalDate.now());
                }
            } else {
                employee.setDateOfJoining(java.time.LocalDate.now());
            }

            employee.setAddress(signupRequest.getAddress());
            employee.setSalary(signupRequest.getSalary() != null ? signupRequest.getSalary() : 0.0);
            
            employeeRepository.save(employee);
        }

        return "User registered successfully!";
    }
}
