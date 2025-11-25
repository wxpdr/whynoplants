package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import projeto.ecommerce.model.Pedido;
import projeto.ecommerce.model.StatusPedido;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // lista pedidos do cliente
    @Query("""
       select p from Pedido p
        where p.cliente.id = :clienteId
        order by p.dataCriacao desc
    """)
    List<Pedido> findByCliente(Long clienteId);

    // busca carrinho atual em aberto
    @Query("""
        select p from Pedido p
         where p.cliente.id = :clienteId
           and p.status = :status
    """)
    Pedido findCarrinho(Long clienteId, StatusPedido status);
}
