package projeto.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ecommerce.model.PedidoItem;

import java.util.List;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {

    List<PedidoItem> findByPedidoId(Long pedidoId);
}
