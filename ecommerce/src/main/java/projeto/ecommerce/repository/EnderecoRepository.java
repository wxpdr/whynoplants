package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ecommerce.model.Endereco;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> { }