package projeto.ecommerce.dto;

import java.math.BigDecimal;

public record PedidoFinalizacaoDTO(
        Long enderecoId,
        String formaPagamento,
        String freteOpcao,
        BigDecimal freteValor
) {}
