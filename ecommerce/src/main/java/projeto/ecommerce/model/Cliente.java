package projeto.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
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

    private String email;

    @JsonIgnore
    private String senhaHash;

    private String primeiroNome;

    private String sobrenome;

    private String cpf;

    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    private Genero genero;


    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.Builder.Default
    private List<Endereco> enderecos = new ArrayList<>();

    public String getNomeCompleto() { return primeiroNome + " " + sobrenome; }
}
