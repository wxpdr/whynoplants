package projeto.ecommerce.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import projeto.ecommerce.dto.ProdutoListDTO;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.repository.ProdutoRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private Produto suculenta;
    private Produto samambaia;

    @BeforeEach
    void setUp() {
        suculenta = new Produto();
        suculenta.setId(1L);
        suculenta.setCodigo("SUC001");
        suculenta.setNome("Suculenta");
        suculenta.setQuantidade(10);
        suculenta.setValor(new BigDecimal("20.00"));
        suculenta.setAtivo(true);

        samambaia = new Produto();
        samambaia.setId(2L);
        samambaia.setCodigo("SAM001");
        samambaia.setNome("Samambaia");
        samambaia.setQuantidade(5);
        samambaia.setValor(new BigDecimal("35.00"));
        samambaia.setAtivo(true);
    }

    @Test
    void listar_deveRetornarPageDeProdutoListDTOComDadosCorretos() {
        Page<Produto> pageEntity = new PageImpl<>(List.of(suculenta, samambaia));

        when(produtoRepository.search(isNull(), eq(true), any(Pageable.class)))
                .thenReturn(pageEntity);

        Page<ProdutoListDTO> resultado =
                produtoService.listar(null, true, 0, 10);

        assertThat(resultado.getContent()).hasSize(2);
        ProdutoListDTO dto1 = resultado.getContent().get(0);
        assertThat(dto1.id()).isEqualTo(1L);
        assertThat(dto1.nome()).isEqualTo("Suculenta");
        assertThat(dto1.valor()).isEqualByComparingTo("20.00");
        assertThat(dto1.ativo()).isTrue();

        verify(produtoRepository, times(1))
                .search(isNull(), eq(true), any(Pageable.class));
    }

    @Test
    void detalhar_deveLancarExcecaoQuandoProdutoNaoEncontrado() {
        when(produtoRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> produtoService.detalhar(99L));

        assertThat(ex.getMessage()).contains("Produto não encontrado");
    }

    @Test
    void atualizarQuantidade_devePersistirNovaQuantidadeQuandoValida() {
        when(produtoRepository.findById(1L))
                .thenReturn(Optional.of(suculenta));

        produtoService.atualizarQuantidade(1L, 3);

        assertThat(suculenta.getQuantidade()).isEqualTo(3);
        verify(produtoRepository, times(1)).save(suculenta);
    }

    @Test
    void atualizarQuantidade_deveLancarExcecaoQuandoQuantidadeNegativa() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> produtoService.atualizarQuantidade(1L, -1));

        assertThat(ex.getMessage()).contains("Quantidade inválida");
        verify(produtoRepository, never()).findById(anyLong());
        verify(produtoRepository, never()).save(any(Produto.class));
    }
}
