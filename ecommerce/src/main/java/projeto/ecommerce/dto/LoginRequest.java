package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String senha // por enquanto senha pura; no front vamos enviar SHA-256
) {}
