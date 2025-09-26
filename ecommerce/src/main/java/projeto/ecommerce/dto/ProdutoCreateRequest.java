// src/main/java/projeto/ecommerce/dto/ProdutoCreateRequest.java
package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoCreateRequest(
        @NotBlank @Size(max=32)  String codigo,
        @NotBlank @Size(max=150) String nome,
        @NotNull  @Min(0)        Integer quantidade,
        @NotNull                 BigDecimal valor,
        @Size(max=2000)          String descricao,
        @DecimalMin("1.0") @DecimalMax("5.0") BigDecimal avaliacao,
        @Min(0)                  Integer principalIndex // índice da imagem principal (0-based)
) {}
