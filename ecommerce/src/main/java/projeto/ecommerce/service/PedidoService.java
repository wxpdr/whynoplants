package projeto.ecommerce.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projeto.ecommerce.dto.CheckoutItemDTO;
import projeto.ecommerce.dto.CheckoutRequestDTO;
import projeto.ecommerce.dto.PedidoConfirmacaoDTO;
import projeto.ecommerce.dto.PedidoDetalheDTO;
import projeto.ecommerce.dto.PedidoFinalizacaoDTO;
import projeto.ecommerce.dto.PedidoItemDetalheDTO;
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
     * Finaliza a compra do cliente logado (fluxo direto).
     *
     * Regras:
     * - Cliente deve estar logado (id sessão obrigatório)
     * - Deve haver ao menos 1 item no carrinho
     * - Usa endereço de ENTREGA padrão; se não tiver, usa o primeiro
     * - Calcula valor dos itens a partir do valor atual do produto no banco
     * - Salva frete e valor total
     * - Cria pedido com status PAGO (pagamento automático)
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

            BigDecimal unit = produto.getValor();
            BigDecimal totalItem = unit.multiply(BigDecimal.valueOf(qtd));

            PedidoItem pi = PedidoItem.builder()
                    .produto(produto)
                    .quantidade(qtd)
                    .valorUnitario(unit)
                    .valorTotal(totalItem)
                    .build();

            itens.add(pi);
            somaItens = somaItens.add(totalItem);

            // Atualiza estoque e inativa se zerar
            Integer estoqueAtual = produto.getQuantidade();
            if (estoqueAtual == null) {
                estoqueAtual = 0;
            }

            if (estoqueAtual < qtd) {
                throw new IllegalArgumentException(
                        "Estoque insuficiente para o produto: " + produto.getNome()
                );
            }

            int novoEstoque = estoqueAtual - qtd;
            produto.setQuantidade(novoEstoque);

            if (novoEstoque == 0) {
                produto.setAtivo(false);
            }

            produtoRepo.save(produto);
        }

        // 4) Calcula frete + total
        BigDecimal freteValor = dto.freteValor() != null ? dto.freteValor() : BigDecimal.ZERO;
        BigDecimal total = somaItens.add(freteValor);

        // 5) Monta pedido
        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .enderecoEntrega(enderecoEntrega)
                // 🔴 ANTES: .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                // 🟢 AGORA: pagamento automático
                .status(StatusPedido.PAGO)               // ou StatusPedido.PAGAMENTO_APROVADO, se esse for o nome do enum
                .formaPagamento(dto.formaPagamento())
                .freteOpcao(dto.freteOpcao())
                .freteValor(freteValor)
                .valorItens(somaItens)
                .valorTotal(total)
                .build();

        for (PedidoItem pi : itens) {
            pi.setPedido(pedido);
            pedido.getItens().add(pi);
        }

        pedido = pedidoRepo.save(pedido);

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

    // ===================== FINALIZAR CARRINHO (Sprint 5/6) =====================

    @Transactional
    public PedidoConfirmacaoDTO finalizarCarrinho(Long clienteId,
                                                  PedidoFinalizacaoDTO dto,
                                                  Long userIdSessao) {
        if (userIdSessao == null) {
            throw new SecurityException("Usuário não autenticado.");
        }
        if (!clienteId.equals(userIdSessao)) {
            throw new SecurityException("Você só pode finalizar seus próprios pedidos.");
        }
        if (dto == null) {
            throw new IllegalArgumentException("Dados de finalização são obrigatórios.");
        }

        Pedido pedido = pedidoRepo.findCarrinho(clienteId, StatusPedido.CARRINHO);
        if (pedido == null) {
            throw new IllegalStateException("Nenhum carrinho em aberto para este cliente.");
        }

        if (dto.enderecoId() == null) {
            throw new IllegalArgumentException("Endereço de entrega é obrigatório.");
        }

        Endereco endereco = enderecoRepo.findById(dto.enderecoId())
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado."));

        if (!endereco.getCliente().getId().equals(clienteId)) {
            throw new SecurityException("Endereço não pertence ao cliente.");
        }

        pedido.setEnderecoEntrega(endereco);

        // forma de pagamento
        if (dto.formaPagamento() != null && !dto.formaPagamento().isBlank()) {
            try {
                FormaPagamento fp = FormaPagamento.valueOf(dto.formaPagamento().toUpperCase());
                pedido.setFormaPagamento(fp);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Forma de pagamento inválida.");
            }
        }

        // frete
        pedido.setFreteOpcao(dto.freteOpcao());
        BigDecimal frete = dto.freteValor() != null ? dto.freteValor() : BigDecimal.ZERO;
        pedido.setFreteValor(frete);

        // recalcular valor total
        if (pedido.getValorItens() == null) {
            pedido.setValorItens(BigDecimal.ZERO);
        }
        pedido.setValorTotal(pedido.getValorItens().add(frete));

        // 🔴 ANTES: status AGUARDANDO_PAGAMENTO
        // 🟢 AGORA: pagamento automático ao finalizar
        pedido.setStatus(StatusPedido.PAGO);   // ou StatusPedido.PAGAMENTO_APROVADO

        // (Sprint 6: histórico de status aqui, se tiver)

        pedido = pedidoRepo.save(pedido);

        return new PedidoConfirmacaoDTO(
            pedido.getId(),
            pedido.getValorItens(),
            pedido.getFreteValor(),
            pedido.getValorTotal(),
            pedido.getStatus().name()
        );
    }

    // ===================== DETALHES DO PEDIDO (Sprint 5) =====================

    public PedidoDetalheDTO buscarDetalhesPedido(Long userIdSessao, Long pedidoId) {
        if (userIdSessao == null) {
            throw new SecurityException("Usuário não autenticado.");
        }

        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado."));

        if (!pedido.getCliente().getId().equals(userIdSessao)) {
            throw new SecurityException("Você não tem permissão para ver este pedido.");
        }

        List<PedidoItem> itens = pedidoItemRepo.findByPedidoId(pedidoId);

        List<PedidoItemDetalheDTO> itensDTO = itens.stream()
                .map(i -> new PedidoItemDetalheDTO(
                        i.getProduto().getId(),
                        i.getProduto().getNome(),
                        i.getQuantidade(),
                        i.getValorUnitario(),
                        i.getValorTotal()
                ))
                .toList();

        return new PedidoDetalheDTO(
                pedido.getId(),
                pedido.getDataCriacao(),
                pedido.getStatus(),
                pedido.getFormaPagamento(),
                pedido.getFreteOpcao(),
                pedido.getFreteValor(),
                pedido.getValorItens(),
                pedido.getValorTotal(),
                itensDTO
        );
    }

    // ===================== LISTAR TODOS OS PEDIDOS (ADMIN/ESTOQUE) =====================

    public List<PedidoResumoDTO> listarTodosPedidos() {
        List<Pedido> pedidos = pedidoRepo.findAllByOrderByDataCriacaoDesc();
        List<PedidoResumoDTO> dtos = new ArrayList<>();

        for (Pedido p : pedidos) {
            dtos.add(new PedidoResumoDTO(
                    p.getId(),
                    p.getDataCriacao(),
                    p.getStatus(),
                    p.getValorTotal()
            ));
        }

        return dtos;
    }

    // ===================== ATUALIZAR STATUS DE UM PEDIDO (SPRINT 6) =====================

    @Transactional
    public PedidoResumoDTO atualizarStatus(Long pedidoId, String novoStatusStr) {
        if (novoStatusStr == null || novoStatusStr.isBlank()) {
            throw new IllegalArgumentException("Status não informado.");
        }

        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(novoStatusStr.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Status de pedido inválido: " + novoStatusStr);
        }

        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado."));

        pedido.setStatus(novoStatus);

        pedido = pedidoRepo.save(pedido);

        return new PedidoResumoDTO(
                pedido.getId(),
                pedido.getDataCriacao(),
                pedido.getStatus(),
                pedido.getValorTotal()
        );
    }
}
