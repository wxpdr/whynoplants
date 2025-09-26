// src/main/java/projeto/ecommerce/repository/ProdutoRepository.java
package projeto.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import projeto.ecommerce.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("""
        SELECT p FROM Produto p
        WHERE (:q IS NULL OR :q = '' OR
               LOWER(p.nome)   LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:ativo IS NULL OR p.ativo = :ativo)
    """)
    Page<Produto> search(String q, Boolean ativo, Pageable pageable);
}
