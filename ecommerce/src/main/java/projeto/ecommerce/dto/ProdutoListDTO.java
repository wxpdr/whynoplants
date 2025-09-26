// src/main/java/projeto/ecommerce/dto/ProdutoListDTO.java
package projeto.ecommerce.dto;

import java.math.BigDecimal;

public record ProdutoListDTO(
        Long id, String codigo, String nome,
        Integer quantidade, BigDecimal valor, Boolean ativo
) {}
