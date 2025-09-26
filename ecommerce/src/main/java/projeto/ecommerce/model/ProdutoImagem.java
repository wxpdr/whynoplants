// src/main/java/projeto/ecommerce/model/ProdutoImagem.java
package projeto.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="produto_imagens", indexes = @Index(name="idx_pi_produto", columnList="produto_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProdutoImagem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name="produto_id")
    private Produto produto;

    @Column(nullable=false, length=255)
    private String arquivo; // caminho relativo/URL

    @Column(nullable=false)
    private Boolean principal = false;

    @Column(nullable=false)
    private Integer ordem = 0;
}
