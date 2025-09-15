package projeto.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.sql.Timestamp;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Size(min = 11, max = 11)
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos numéricos")
    @Column(length = 11, unique = true, nullable = false)
    private String cpf;

    @Email
    @NotBlank
    @Size(max = 160)
    @Column(unique = true, nullable = false, length = 160)
    private String email;

    @NotBlank
    @Size(max = 100)
    @JsonProperty(access = Access.WRITE_ONLY)
    @Column(nullable = false, length = 100)
    private String senha;

    @Column(name = "status", nullable = false)
    private boolean ativo = true;

    @NotBlank
    @Size(max = 20)
    @Column(name = "grupo", nullable = false, length = 20)
    private String perfil;

    @Column(name = "data_criacao", nullable = false, updatable = false,
            columnDefinition = "timestamp default current_timestamp")
    private Timestamp dataCriacao;

    @PrePersist
    void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = new Timestamp(System.currentTimeMillis());
        }
        if (email != null) email = email.toLowerCase();
    }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; } public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; } public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email == null ? null : email.toLowerCase(); }
    public String getSenha() { return senha; } public void setSenha(String senha) { this.senha = senha; }
    public boolean isAtivo() { return ativo; } public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public String getPerfil() { return perfil; } public void setPerfil(String perfil) { this.perfil = perfil; }
    public Timestamp getDataCriacao() { return dataCriacao; } public void setDataCriacao(Timestamp dataCriacao) { this.dataCriacao = dataCriacao; }
}
