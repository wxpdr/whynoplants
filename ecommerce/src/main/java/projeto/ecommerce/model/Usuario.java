package projeto.ecommerce.model;

public class Usuario {

    private String email;
    private String senha;  // Armazena o hash
    private boolean ativo;
    private String perfil;

    public Usuario(String email, String senha, boolean ativo, String perfil) {
        this.email = email;
        this.senha = senha;
        this.ativo = ativo;
        this.perfil = perfil;
    }

    public String getEmail() {
        return email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public String getPerfil() {
        return perfil;
    }
}
