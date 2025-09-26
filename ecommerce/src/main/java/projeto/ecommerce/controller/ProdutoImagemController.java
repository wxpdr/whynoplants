// src/main/java/projeto/ecommerce/controller/ProdutoImagemController.java
/*package projeto.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.service.ProdutoImagemService;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoImagemController {
    private final ProdutoImagemService service;

    @PatchMapping("/{produtoId}/imagens/{imagemId}/principal")
    public ResponseEntity<?> setPrincipal(@PathVariable Long produtoId, @PathVariable Long imagemId) {
        service.tornarPrincipal(produtoId, imagemId);
        return ResponseEntity.noContent().build();
    }
}
*/