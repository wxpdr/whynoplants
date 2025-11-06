package projeto.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(
        @NotBlank String senhaAtual,
        @NotBlank @Size(min=6,max=64) String novaSenha
) { }