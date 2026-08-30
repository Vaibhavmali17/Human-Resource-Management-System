package com.hrm.backend.repository;

import com.hrm.backend.entity.Employee;
import com.hrm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserId(Long userId);
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_Username(String username);
}
