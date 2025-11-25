package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import projeto.ecommerce.model.Cliente;
import projeto.ecommerce.model.Endereco;
import projeto.ecommerce.model.TipoEndereco;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    @Query("""
       select e from Endereco e
        where e.cliente.id = :clienteId and e.tipo = :tipo
        order by e.id asc
    """)
    List<Endereco> findByClienteAndTipo(Long clienteId, TipoEndereco tipo);

    // novo: usado em tornarEnderecoPadrao
    List<Endereco> findByCliente(Cliente cliente);
}
