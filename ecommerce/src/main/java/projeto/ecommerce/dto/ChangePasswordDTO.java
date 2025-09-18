package projeto.ecommerce.dto;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordDTO(
    @NotBlank String senhaAtual,
    @NotBlank String novaSenha
) {}
