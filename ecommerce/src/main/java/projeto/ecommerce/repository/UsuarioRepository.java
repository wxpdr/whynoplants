package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ecommerce.model.Usuario;

import java.util.Optional;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    List<Usuario> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
}
