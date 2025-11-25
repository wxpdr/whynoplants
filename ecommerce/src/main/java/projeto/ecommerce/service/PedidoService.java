package projeto.ecommerce.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projeto.ecommerce.dto.CheckoutItemDTO;
import projeto.ecommerce.dto.CheckoutRequestDTO;
import projeto.ecommerce.dto.PedidoResumoDTO;
import projeto.ecommerce.model.*;
import projeto.ecommerce.repository.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final PedidoItemRepository pedidoItemRepo;
    private final ClienteRepository clienteRepo;
    private final ProdutoRepository produtoRepo;
    private final EnderecoRepository enderecoRepo;

    /**
     * Finaliza a compra do cliente logado.
     *
     * Regras (Sprint 5):
     * - Cliente deve estar logado (id sessão obrigatório)
     * - Deve haver ao menos 1 item no carrinho
     * - Usa endereço de ENTREGA padrão; se não tiver, usa o primeiro
     * - Calcula valor dos itens a partir do valor atual do produto no banco
     * - Salva frete e valor total
     * - Cria pedido com status AGUARDANDO_PAGAMENTO
     */
    @Transactional
    public PedidoResumoDTO finalizarPedido(Long userIdSessao, CheckoutRequestDTO dto) {
        if (userIdSessao == null) {
            throw new SecurityException("Usuário não autenticado.");
        }
        if (dto == null || dto.itens() == null || dto.itens().isEmpty()) {
            throw new IllegalArgumentException("Carrinho vazio.");
        }

        // 1) Carrega cliente
        Cliente cliente = clienteRepo.findById(userIdSessao)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        // 2) Escolhe endereço de entrega (tipo ENTREGA, preferindo o padrão)
        List<Endereco> endEntregas = enderecoRepo.findByClienteAndTipo(
                cliente.getId(), TipoEndereco.ENTREGA
        );
        if (endEntregas.isEmpty()) {
            throw new IllegalStateException("Cliente não possui endereço de entrega cadastrado.");
        }
        Endereco enderecoEntrega = endEntregas.stream()
                .filter(e -> {
                    try {
                        // se tiver campo boolean padrao
                        return e.isPadrao();
                    } catch (Exception ex) {
                        return false;
                    }
                })
                .findFirst()
                .orElse(endEntregas.get(0));

        // 3) Monta itens do pedido a partir dos produtos do banco
        List<PedidoItem> itens = new ArrayList<>();
        BigDecimal somaItens = BigDecimal.ZERO;

        for (CheckoutItemDTO itemDTO : dto.itens()) {
            if (itemDTO == null || itemDTO.produtoId() == null) {
                throw new IllegalArgumentException("Item do carrinho inválido.");
            }
            int qtd = itemDTO.quantidade() == null ? 0 : itemDTO.quantidade();
            if (qtd <= 0) {
                throw new IllegalArgumentException("Quantidade inválida para o produto " + itemDTO.produtoId());
            }

            Produto produto = produtoRepo.findById(itemDTO.produtoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + itemDTO.produtoId()));

            // valor unitário atual do produto
            BigDecimal unit = produto.getValor();
            BigDecimal totalItem = unit.multiply(BigDecimal.valueOf(qtd));

            PedidoItem pi = PedidoItem.builder()
                    .produto(produto)
                    .quantidade(qtd)
                    .valorUnitario(unit)
                    .valorTotal(totalItem) // reforça antes do @PrePersist
                    .build();

            itens.add(pi);
            somaItens = somaItens.add(totalItem);

            // (Opcional) atualizar estoque aqui em Sprint 6:
            // produto.setQuantidade(produto.getQuantidade() - qtd);
        }

        // 4) Calcula frete + total
        BigDecimal freteValor = dto.freteValor() != null ? dto.freteValor() : BigDecimal.ZERO;
        BigDecimal total = somaItens.add(freteValor);

        // 5) Monta pedido
        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .enderecoEntrega(enderecoEntrega)
                .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                .formaPagamento(dto.formaPagamento())
                .freteOpcao(dto.freteOpcao())
                .freteValor(freteValor)
                .valorItens(somaItens)
                .valorTotal(total)
                .build();

        // vincula itens ao pedido
        for (PedidoItem pi : itens) {
            pi.setPedido(pedido);
            pedido.getItens().add(pi);
        }

        // 6) Persiste tudo (cascade em Pedido -> PedidoItem)
        pedido = pedidoRepo.save(pedido);

        // 7) (Opcional para Sprint 6) Registrar histórico de status aqui

        // 8) Retorno para o front
        return new PedidoResumoDTO(
                pedido.getId(),
                pedido.getDataCriacao(),
                pedido.getStatus(),
                pedido.getValorTotal()
        );
    }

    // ===================== LISTAR PEDIDOS DO CLIENTE =====================

    public List<PedidoResumoDTO> listarPedidosDoCliente(Long userIdSessao, Long clienteId) {
        if (!clienteId.equals(userIdSessao)) {
            throw new SecurityException("Acesso negado.");
        }

        List<Pedido> pedidos = pedidoRepo.findByCliente(clienteId);

        return pedidos.stream()
                .map(p -> new PedidoResumoDTO(
                        p.getId(),
                        p.getDataCriacao(),
                        p.getStatus(),
                        p.getValorTotal()
                ))
                .toList();
    }

}
