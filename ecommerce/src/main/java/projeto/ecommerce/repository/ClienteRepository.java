package projeto.ecommerce.repository;

import projeto.ecommerce.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    Optional<Cliente> findByEmail(String email);
}