package projeto.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "enderecos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Endereco {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TipoEndereco tipo;

    @NotBlank
    @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 dígitos numéricos")
    @Column(length = 8)
    private String cep;

    @NotBlank private String logradouro;
    @NotBlank private String bairro;
    @NotBlank private String cidade;

    @NotBlank
    @Size(min = 2, max = 2)
    @Column(length = 2)
    private String uf;

    @NotBlank
    private String numero;

    private String complemento;

    @Column(columnDefinition = "TINYINT(1)", nullable = false)
    private boolean padrao = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    }

