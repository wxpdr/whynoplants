package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.CheckoutRequestDTO;
import projeto.ecommerce.dto.PedidoConfirmacaoDTO;
import projeto.ecommerce.dto.PedidoDetalheDTO;
import projeto.ecommerce.dto.PedidoFinalizacaoDTO;
import projeto.ecommerce.dto.PedidoResumoDTO;
import projeto.ecommerce.service.PedidoService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    

    // ----------- FINALIZAR PEDIDO (CHECKOUT) -----------
    @PostMapping
    public ResponseEntity<PedidoResumoDTO> finalizar(
            @RequestBody CheckoutRequestDTO dto,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");  // Garantir que o usuário esteja logado
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        PedidoResumoDTO resumo = pedidoService.finalizarPedido(userId, dto);
        return ResponseEntity.ok(resumo);
    }


        // ----------- LISTAR TODOS OS PEDIDOS (ADMIN / ESTOQUE) -----------
    @GetMapping
    public ResponseEntity<List<PedidoResumoDTO>> listarTodos(HttpSession session) {
        String perfil = (String) session.getAttribute("USER_PERFIL");
        if (perfil == null || 
           (!perfil.equals("Administrador") && !perfil.equals("Estoquista"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<PedidoResumoDTO> lista = pedidoService.listarTodosPedidos();
        return ResponseEntity.ok(lista);
    }

    // ----------- ATUALIZAR STATUS DE UM PEDIDO -----------
    @PatchMapping("/{pedidoId}/status")
    public ResponseEntity<PedidoResumoDTO> atualizarStatus(
            @PathVariable Long pedidoId,
            @RequestParam String status,
            HttpSession session
    ) {
        String perfil = (String) session.getAttribute("USER_PERFIL");
        if (perfil == null || 
           (!perfil.equals("Administrador") && !perfil.equals("Estoquista"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        PedidoResumoDTO dto = pedidoService.atualizarStatus(pedidoId, status);
        return ResponseEntity.ok(dto);
    }


    // ----------- LISTAR PEDIDOS DO CLIENTE -----------
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResumoDTO>> listar(
            @PathVariable Long clienteId,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");
        List<PedidoResumoDTO> lista =
                pedidoService.listarPedidosDoCliente(userId, clienteId);

        return ResponseEntity.ok(lista);
    }

    // ----------- FINALIZAR CARRINHO DO CLIENTE -----------
    @PutMapping("/cliente/{clienteId}/finalizar")
    public ResponseEntity<PedidoConfirmacaoDTO> finalizarCarrinho(
            @PathVariable Long clienteId,
            @RequestBody PedidoFinalizacaoDTO dto,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");
        PedidoConfirmacaoDTO r = pedidoService.finalizarCarrinho(clienteId, dto, userId);
        return ResponseEntity.ok(r);
    }

        // ----------- DETALHES DO PEDIDO -----------
    @GetMapping("/{pedidoId}")
    public ResponseEntity<PedidoDetalheDTO> detalhes(
            @PathVariable Long pedidoId,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");
        PedidoDetalheDTO dto = pedidoService.buscarDetalhesPedido(userId, pedidoId);
        return ResponseEntity.ok(dto);
    }

    

}
