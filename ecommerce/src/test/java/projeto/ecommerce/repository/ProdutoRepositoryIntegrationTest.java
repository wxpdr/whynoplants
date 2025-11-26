package projeto.ecommerce.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;

import projeto.ecommerce.model.Produto;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProdutoRepositoryIntegrationTest {

    @Autowired
    private ProdutoRepository produtoRepository;

    
    @Test
    @Rollback(false)
    void deveSalvarEEncontrarProdutoNoBanco() {

        Produto produto = new Produto();
        produto.setCodigo("INT002");
        produto.setNome("Produto Integração");
        produto.setQuantidade(5);
        produto.setValor(new BigDecimal("15.00"));
        produto.setAtivo(true);

        Produto salvo = produtoRepository.save(produto);
        Produto encontrado = produtoRepository.findById(salvo.getId()).orElseThrow();

        System.out.println("🟢 Teste de INTEGRAÇÃO (MySQL) -> PASSOU");
        System.out.println("ID gerado pelo MySQL: " + salvo.getId());
        System.out.println("Nome salvo: " + encontrado.getNome());
        System.out.println("Valor salvo: " + encontrado.getValor());
    }

}
