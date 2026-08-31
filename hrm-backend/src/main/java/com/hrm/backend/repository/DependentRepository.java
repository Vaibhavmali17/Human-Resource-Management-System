package com.hrm.backend.repository;

import com.hrm.backend.entity.Dependent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DependentRepository extends JpaRepository<Dependent, Long> {
    List<Dependent> findByEmployeeId(Long employeeId);
}
