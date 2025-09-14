package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;

public record UsuarioCreateDTO(
        @NotBlank String nome,
        @NotBlank @Size(min=11, max=11) String cpf,
        @Email @NotBlank String email,
        @NotBlank String senha,
        @NotBlank String perfil // "Administrador" ou "Estoquista"
) {}
