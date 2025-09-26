package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoUpdateRequest(
        @NotBlank @Size(max=32)  String codigo,
        @NotBlank @Size(max=150) String nome,
        @NotNull                 BigDecimal valor,
        @NotNull @Min(0)         Integer quantidade,
        @Size(max=2000)          String descricao,
        @DecimalMin("1.0") @DecimalMax("5.0") BigDecimal avaliacao,
        @NotNull                 Boolean ativo
) {}
