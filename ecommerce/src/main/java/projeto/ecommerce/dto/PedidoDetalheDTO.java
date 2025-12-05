package projeto.ecommerce.dto;

import projeto.ecommerce.model.StatusPedido;
import projeto.ecommerce.model.FormaPagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoDetalheDTO(
        Long id,
        LocalDateTime dataCriacao,
        StatusPedido status,
        FormaPagamento formaPagamento,
        String freteOpcao,
        BigDecimal freteValor,
        BigDecimal valorItens,
        BigDecimal valorTotal,
        List<PedidoItemDetalheDTO> itens,
        EnderecoDetalheDTO enderecoEntrega
) {}