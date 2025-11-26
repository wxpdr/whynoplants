package projeto.ecommerce.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import projeto.ecommerce.dto.ProdutoListDTO;
import projeto.ecommerce.service.ProdutoService;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ProdutoController.class)
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProdutoService produtoService;

//     @Test
//     void listarProdutos_deveRetornarPaginaComStatus200_quandoUsuarioAutenticado() throws Exception {
//         ProdutoListDTO suculenta = new ProdutoListDTO(
//                 1L,
//                 "SUC001",
//                 "Suculenta",
//                 10,
//                 new BigDecimal("20.00"),
//                 true
//         );

//         Page<ProdutoListDTO> page = new PageImpl<>(List.of(suculenta));

//         when(produtoService.listar(any(), any(), any(), any()))
//                 .thenReturn(page);

//         mockMvc.perform(get("/api/produtos")
//                         .with(user("pedro").roles("USER")) // usuário “correto”
//                         .accept(MediaType.APPLICATION_JSON))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.content[0].nome").value("Suculenta"))
//                 .andExpect(jsonPath("$.content[0].valor").value(20.00));

//         System.out.println("✅ listarProdutos_deveRetornarPaginaComStatus200_quandoUsuarioAutenticado -> PASSOU (200 OK)");
//     }

    @Test
    void listarProdutos_deveRetornar401_quandoUsuarioNaoAutenticado() throws Exception {

        mockMvc.perform(get("/api/produtos")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        System.out.println("❌ listarProdutos_deveRetornar401_quandoUsuarioNaoAutenticado -> FALHOU COMO ESPERADO (401 Unauthorized)");
    }

}