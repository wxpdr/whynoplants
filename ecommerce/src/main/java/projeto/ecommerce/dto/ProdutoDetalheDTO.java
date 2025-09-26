package projeto.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProdutoDetalheDTO(
        Long id,
        String codigo,
        String nome,
        BigDecimal valor,
        Integer quantidade,
        String descricao,
        BigDecimal avaliacao,
        Boolean ativo,
        List<ImagemDTO> imagens
) {
    public record ImagemDTO(Long id, String arquivo, Boolean principal, Integer ordem) {}
}
