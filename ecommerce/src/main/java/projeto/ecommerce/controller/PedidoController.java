package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.CheckoutRequestDTO;
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
        Long userId = (Long) session.getAttribute("USER_ID");
        PedidoResumoDTO resumo = pedidoService.finalizarPedido(userId, dto);
        return ResponseEntity.ok(resumo);
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
}
