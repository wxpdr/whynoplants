package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;

public class UsuarioUpdateDTO {
    @NotBlank private String nome;
    @NotBlank @Size(min=11, max=11) private String cpf;
    @NotBlank private String perfil;
    private String novaSenha; // opcional

    public String getNome() { return nome; }
    public void setNome(String v) { nome=v; }
    public String getCpf() { return cpf; }
    public void setCpf(String v) { cpf=v; }
    public String getPerfil() { return perfil; }
    public void setPerfil(String v) { perfil=v; }
    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String v) { novaSenha=v; }
}
