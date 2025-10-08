package projeto.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="produto_imagens",
       indexes = {
         @Index(name="idx_pi_produto", columnList="produto_id"),
         @Index(name="idx_pi_principal", columnList="produto_id,principal")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProdutoImagem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name="produto_id")
    @JsonIgnore                                   // << não serialize o produto dentro de cada imagem
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Produto produto;

    @Column(nullable=false, length=255)
    private String arquivo; // caminho relativo/URL

    @Builder.Default
    @Column(nullable=false)
    private Boolean principal = false;

    @Builder.Default
    @Column(nullable=false)
    private Integer ordem = 0;

    @Column(name="criado_em")
    private java.time.LocalDateTime criadoEm;

    @PrePersist
    public void pre() {
        if (criadoEm == null) criadoEm = java.time.LocalDateTime.now();
        if (principal == null) principal = false;
        if (ordem == null) ordem = 0;
    }
}
