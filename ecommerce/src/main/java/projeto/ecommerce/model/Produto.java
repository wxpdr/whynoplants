package projeto.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos",
       indexes = {
           @Index(name = "idx_produto_nome",   columnList = "nome"),
           @Index(name = "idx_produto_codigo", columnList = "codigo")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=32)
    private String codigo;

    @Column(nullable=false, length=150)
    private String nome;

    @Column(nullable=false)
    private Integer quantidade;

    @Column(nullable=false, precision=12, scale=2)
    private BigDecimal valor;

    @Builder.Default
    @Column(nullable=false)
    private Boolean ativo = true;

    @Column(nullable=false, name="criado_em")
    private LocalDateTime criadoEm;

    // ====== CAMPOS ADICIONAIS ======
    @Column(length = 2000)
    private String descricao;

    // 1.0 .. 5.0 (passo 0.5)
    @Column(precision = 2, scale = 1)
    private BigDecimal avaliacao;

    // Galeria de imagens (múltiplas; uma principal)
    @Builder.Default
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    @JsonIgnore                                   // << não serialize as imagens dentro do produto
    @ToString.Exclude @EqualsAndHashCode.Exclude  // evita toString/equals recursivos
    private List<ProdutoImagem> imagens = new ArrayList<>();
    // =================================

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
        if (ativo == null) ativo = true;
    }
}
