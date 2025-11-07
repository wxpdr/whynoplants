package projeto.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes",
       uniqueConstraints = {
           @UniqueConstraint(name="uk_cliente_email", columnNames = "email"),
           @UniqueConstraint(name="uk_cliente_cpf", columnNames = "cpf")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email @NotBlank
    private String email;

    @JsonIgnore
    @NotBlank
    private String senhaHash;

    @NotBlank @Size(min = 3)
    private String primeiroNome;

    @NotBlank @Size(min = 3)
    private String sobrenome;

    @NotBlank
    @Pattern(regexp = "\\d{11}", message = "CPF deve ter 11 dígitos numéricos")
    private String cpf;

    @Past @NotNull
    private LocalDate dataNascimento;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Genero genero;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.Builder.Default
    private List<Endereco> enderecos = new ArrayList<>();

    public String getNomeCompleto() { return primeiroNome + " " + sobrenome; }
}
