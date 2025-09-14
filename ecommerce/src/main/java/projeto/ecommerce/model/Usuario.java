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

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @NotBlank
    @Size(min = 6)
    @Column(nullable = false, length = 100)
    @JsonProperty(access = Access.WRITE_ONLY) // aceita no input, não devolve no output
    private String senha; // hash BCrypt

    @Column(name = "status", nullable = false)
    private boolean ativo = true; // default true para alinhar com DEFAULT 1 do banco

    @Column(name = "grupo", nullable = false, length = 20)
    private String perfil; // "Administrador" / "Estoquista"

    @NotBlank
    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 11)
    @Size(min = 11, max = 11, message = "CPF deve ter 11 dígitos")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter apenas números")
    private String cpf;

    @Column(name = "data_criacao", updatable = false, insertable = false)
    private Timestamp dataCriacao;

    public Usuario() {}

    public Usuario(String email, String senha, boolean ativo, String perfil) {
        this.email = email;
        this.senha = senha;
        this.ativo = ativo;
        this.perfil = perfil;
    }

    // getters/setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; } public void setSenha(String senha) { this.senha = senha; }
    public boolean isAtivo() { return ativo; } public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public String getPerfil() { return perfil; } public void setPerfil(String perfil) { this.perfil = perfil; }
    public String getNome() { return nome; } public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; } public void setCpf(String cpf) { this.cpf = cpf; }
    public Timestamp getDataCriacao() { return dataCriacao; } public void setDataCriacao(Timestamp d) { this.dataCriacao = d; }
}
