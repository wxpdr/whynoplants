package projeto.ecommerce.dto;

import projeto.ecommerce.model.FormaPagamento;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutRequestDTO(
        List<CheckoutItemDTO> itens,
        String freteOpcao,
        BigDecimal freteValor,
        FormaPagamento formaPagamento
) { }
