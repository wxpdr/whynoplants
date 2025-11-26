package projeto.ecommerce.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import projeto.ecommerce.dto.CheckoutItemDTO;
import projeto.ecommerce.dto.CheckoutRequestDTO;
import projeto.ecommerce.dto.PedidoResumoDTO;
import projeto.ecommerce.model.*;
import projeto.ecommerce.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private PedidoItemRepository pedidoItemRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private EnderecoRepository enderecoRepository;

    @InjectMocks
    private PedidoService pedidoService;

    private Cliente cliente;
    private Produto suculenta;
    private Endereco enderecoEntrega;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setEmail("cliente@teste.com");

        suculenta = new Produto();
        suculenta.setId(1L);
        suculenta.setNome("Suculenta");
        suculenta.setValor(new BigDecimal("20.00"));
        suculenta.setQuantidade(10);
        suculenta.setAtivo(true);

        enderecoEntrega = Endereco.builder()
                .id(1L)
                .tipo(TipoEndereco.ENTREGA)
                .cep("12345678")
                .logradouro("Rua Teste")
                .bairro("Centro")
                .cidade("Cidade")
                .uf("SP")
                .numero("100")
                .cliente(cliente)
                .padrao(true)
                .build();
    }

    @Test
    void finalizarPedido_deveGerarResumoComStatusAguardandoPagamentoEValorTotalCorreto() {
        CheckoutItemDTO item = new CheckoutItemDTO(1L, 2);
        CheckoutRequestDTO request = new CheckoutRequestDTO(
                List.of(item),
                "SEDEX",
                BigDecimal.ZERO,
                FormaPagamento.CARTAO
        );

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(enderecoRepository.findByClienteAndTipo(1L, TipoEndereco.ENTREGA))
                .thenReturn(List.of(enderecoEntrega));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(suculenta));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
            Pedido p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        PedidoResumoDTO resumo = pedidoService.finalizarPedido(1L, request);

        assertThat(resumo).isNotNull();
        assertThat(resumo.id()).isEqualTo(10L);
        assertThat(resumo.status()).isEqualTo(StatusPedido.AGUARDANDO_PAGAMENTO);
        assertThat(resumo.valorTotal()).isEqualByComparingTo("40.00"); // 2 x 20.00

        verify(produtoRepository, times(1)).findById(1L);
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
    }

    @Test
    void finalizarPedido_deveLancarExcecaoQuandoClienteNaoExiste() {
        CheckoutRequestDTO request = new CheckoutRequestDTO(
                List.of(new CheckoutItemDTO(1L, 1)),
                "PAC",
                BigDecimal.ZERO,
                FormaPagamento.BOLETO
        );

        when(clienteRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> pedidoService.finalizarPedido(1L, request));

        assertThat(ex.getMessage()).contains("Cliente não encontrado");
    }

    @Test
    void finalizarPedido_deveLancarExcecaoQuandoCarrinhoVazio() {
        CheckoutRequestDTO request = new CheckoutRequestDTO(
                List.of(),
                "PAC",
                BigDecimal.ZERO,
                FormaPagamento.BOLETO
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> pedidoService.finalizarPedido(1L, request));

        assertThat(ex.getMessage()).contains("Carrinho vazio");
        verifyNoInteractions(clienteRepository, produtoRepository, pedidoRepository);
    }
}
