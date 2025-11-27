package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import projeto.ecommerce.model.Pedido;
import projeto.ecommerce.model.StatusPedido;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // lista pedidos do cliente (Sprint 5)
    @Query("""
       select p from Pedido p
        where p.cliente.id = :clienteId
        order by p.dataCriacao desc
    """)
    List<Pedido> findByCliente(Long clienteId);

    // busca carrinho atual em aberto (Sprint 3/5)
    @Query("""
        select p from Pedido p
         where p.cliente.id = :clienteId
           and p.status = :status
    """)
    Pedido findCarrinho(Long clienteId, StatusPedido status);

    // lista TODOS os pedidos (para admin/estoque) ordenados do mais recente pro mais antigo (Sprint 6)
    List<Pedido> findAllByOrderByDataCriacaoDesc();
}
