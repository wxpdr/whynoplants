// src/main/java/projeto/ecommerce/repository/ProdutoImagemRepository.java
package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ecommerce.model.ProdutoImagem;

public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {}
