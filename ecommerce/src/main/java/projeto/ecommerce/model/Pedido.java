package projeto.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "pedidos",
        indexes = {
                @Index(name = "idx_pedido_cliente", columnList = "cliente_id"),
                @Index(name = "idx_pedido_status",  columnList = "status")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- relacionamentos principais ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endereco_id")
    private Endereco enderecoEntrega;

    // --- campos principais ---

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private StatusPedido status;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 20)
    private FormaPagamento formaPagamento;

    @Column(name = "frete_opcao", length = 30)
    private String freteOpcao;

    @Column(name = "frete_valor", precision = 12, scale = 2, nullable = false)
    private BigDecimal freteValor;

    @Column(name = "valor_itens", precision = 12, scale = 2, nullable = false)
    private BigDecimal valorItens;

    @Column(name = "valor_total", precision = 12, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    // --- itens do pedido ---

    @Builder.Default
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> itens = new ArrayList<>();

    // --- callbacks ---

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (freteValor == null) {
            freteValor = BigDecimal.ZERO;
        }
        if (valorItens == null) {
            valorItens = BigDecimal.ZERO;
        }
        if (valorTotal == null) {
            valorTotal = BigDecimal.ZERO;
        }
        if (status == null) {
            status = StatusPedido.CARRINHO; // carrinho aberto por padrão
        }
    }

    // opcional: helper pra atualizar totais a partir da lista de itens
    public void recalcularTotais() {
        BigDecimal somaItens = itens.stream()
                .map(PedidoItem::getValorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorItens = somaItens;
        this.valorTotal = somaItens.add(freteValor != null ? freteValor : BigDecimal.ZERO);
    }
}
