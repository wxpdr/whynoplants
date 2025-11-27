package projeto.ecommerce.dto;

import java.math.BigDecimal;

public record PedidoItemDetalheDTO(
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorTotal
) {}
