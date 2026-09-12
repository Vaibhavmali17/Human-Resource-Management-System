package com.hrm.backend.service;

import com.hrm.backend.dto.ChangePasswordRequest;
import com.hrm.backend.dto.HrOnboardRequest;
import com.hrm.backend.dto.JwtAuthResponse;
import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.RoleName;
import com.hrm.backend.entity.User;
import com.hrm.backend.exception.APIException;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.repository.RoleRepository;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           EmployeeRepository employeeRepository,
                           EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.employeeRepository = employeeRepository;
        this.emailService = emailService;
    }

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername())
                .orElse(null);
        Boolean mustChangePassword = (user != null && Boolean.TRUE.equals(user.getMustChangePassword()));

        return new JwtAuthResponse(token, mustChangePassword);
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
        Role userRole = roleRepository.findByName(RoleName.ROLE_EMPLOYEE)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Employee Role not found."));
        roles.add(userRole);

        user.setRoles(roles);
        user.setFirstName(signupRequest.getFirstName() != null ? signupRequest.getFirstName() : signupRequest.getUsername());
        user.setLastName(signupRequest.getLastName() != null ? signupRequest.getLastName() : "");
        user.setEmail(signupRequest.getEmail());
        user.setMustChangePassword(false);

        User savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFirstName(user.getFirstName());
        employee.setLastName(user.getLastName());

        String email = signupRequest.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = signupRequest.getUsername() + "@company.com";
        }
        employee.setEmail(email);

        employee.setDepartment(signupRequest.getDepartment() != null && !signupRequest.getDepartment().isEmpty() ? signupRequest.getDepartment() : "General");
        employee.setDesignation(signupRequest.getDesignation() != null && !signupRequest.getDesignation().isEmpty() ? signupRequest.getDesignation() : "Associate");
        employee.setPhoneNumber(signupRequest.getPhone() != null ? signupRequest.getPhone() : "");

        if (signupRequest.getDateOfJoining() != null && !signupRequest.getDateOfJoining().trim().isEmpty()) {
            try {
                employee.setDateOfJoining(LocalDate.parse(signupRequest.getDateOfJoining().trim()));
            } catch (Exception e) {
                employee.setDateOfJoining(LocalDate.now());
            }
        } else {
            employee.setDateOfJoining(LocalDate.now());
        }

        employee.setAddress(signupRequest.getAddress());
        employee.setSalary(signupRequest.getSalary() != null ? signupRequest.getSalary() : 0.0);
        employee.setEmployeeCode("EMP-" + String.format("%04d", savedUser.getId()));

        employeeRepository.save(employee);

        return "Employee registered successfully!";
    }

    @Override
    public String registerAdmin(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Username check failed: Username is already taken!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Admin Role not found."));
        roles.add(adminRole);
        user.setRoles(roles);
        user.setMustChangePassword(false);

        User savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFirstName(signupRequest.getFirstName() != null ? signupRequest.getFirstName() : signupRequest.getUsername());
        employee.setLastName(signupRequest.getLastName() != null ? signupRequest.getLastName() : "");

        String email = signupRequest.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = signupRequest.getUsername() + "@company.com";
        }
        employee.setEmail(email);
        employee.setDepartment("Administration");
        employee.setDesignation("HR Admin");
        employee.setPhoneNumber(signupRequest.getPhone() != null ? signupRequest.getPhone() : "");
        employee.setDateOfJoining(LocalDate.now());
        employee.setSalary(0.0);
        employeeRepository.save(employee);

        return "Admin registered successfully!";
    }

    @Override
    public Map<String, String> onboardHr(HrOnboardRequest request) {
        String firstName = request.getFirstName() != null ? request.getFirstName().trim() : "";
        String lastName = request.getLastName() != null ? request.getLastName().trim() : "";
        String baseUsername = (firstName + "." + lastName).toLowerCase().replaceAll("[^a-z0-9.]", "");
        if (baseUsername.isEmpty() || baseUsername.equals(".")) {
            baseUsername = "hr.admin";
        }
        String username = baseUsername;
        int counter = 2;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String tempCode = sb.toString();

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(tempCode));
        user.setEmail(request.getEmail());
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setMustChangePassword(true);

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Admin Role not found."));
        roles.add(adminRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment() != null && !request.getDepartment().trim().isEmpty() ? request.getDepartment().trim() : "Human Resources");
        employee.setDesignation(request.getDesignation() != null && !request.getDesignation().trim().isEmpty() ? request.getDesignation().trim() : "HR Executive");
        employee.setDateOfJoining(LocalDate.now());
        employee.setEmployeeCode("EMP-" + String.format("%04d", savedUser.getId()));
        employeeRepository.save(employee);

        try {
            String subject = "Your HR/Admin Portal Access";
            String body = "Hello " + firstName + " " + lastName + ",\n\n" +
                    "Your HR/Admin account has been onboarded successfully.\n\n" +
                    "Username: " + username + "\n" +
                    "Temporary Password: " + tempCode + "\n\n" +
                    "IMPORTANT: You must change your password on your first login.";
            emailService.sendEmailAsync(request.getEmail(), subject, body);
            return Map.of("message", "HR Account created for " + request.getEmail() + ". Invite email is being dispatched.");
        } catch (Exception e) {
            System.err.println("[SMTP FAILURE] Failed to send HR onboarding email to " + request.getEmail() + ". Generated Username: " + username + ", Temporary Code: " + tempCode + ". Error: " + e.getMessage());
            return Map.of("message", "HR Account created for " + request.getEmail() + ", but invite email failed to send (SMTP Error). Generated credentials: Username: " + username + " / Temporary Password: " + tempCode);
        }
    }

    @Override
    public String changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return "Password changed successfully!";
    }
}
