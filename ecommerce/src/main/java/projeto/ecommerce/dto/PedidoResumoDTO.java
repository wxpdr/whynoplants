package projeto.ecommerce.dto;

import projeto.ecommerce.model.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoResumoDTO(
        Long id,
        LocalDateTime dataCriacao,
        StatusPedido status,
        BigDecimal valorTotal
) { }
