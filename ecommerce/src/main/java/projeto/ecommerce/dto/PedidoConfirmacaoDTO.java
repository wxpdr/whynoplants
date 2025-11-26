package projeto.ecommerce.dto;

import java.math.BigDecimal;

public record PedidoConfirmacaoDTO(
        Long pedidoId,
        BigDecimal valorItens,
        BigDecimal freteValor,
        BigDecimal valorTotal,
        String status
) {}
