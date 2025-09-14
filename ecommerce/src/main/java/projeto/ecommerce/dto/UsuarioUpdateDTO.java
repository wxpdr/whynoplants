package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;

public record UsuarioUpdateDTO(
        @NotBlank String nome,
        @NotBlank @Size(min=11, max=11) String cpf,
        @NotBlank String perfil,
        String novaSenha // opcional
) {}
