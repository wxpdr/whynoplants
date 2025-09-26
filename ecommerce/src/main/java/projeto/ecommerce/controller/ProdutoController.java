// src/main/java/projeto/ecommerce/controller/ProdutoController.java
package projeto.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.ProdutoListDTO;
import projeto.ecommerce.dto.QuantidadeDTO;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.service.ProdutoService;
import java.util.Map;


@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {
    private final ProdutoService service;

    // GET /api/produtos?q=smart&page=0&size=10&ativo=true
    @GetMapping
    public Page<ProdutoListDTO> listar(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) Boolean ativo,
            @RequestParam(required=false) Integer page,
            @RequestParam(required=false) Integer size
    ) {
        return service.listar(q, ativo, page, size);
    }

    @GetMapping("/{id}")
    public Produto detalhar(@PathVariable Long id) {
        return service.detalhar(id);
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<?> ativar(@PathVariable Long id) {
        service.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<?> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<?> atualizarQuantidade(@PathVariable Long id,
                                             @RequestBody QuantidadeDTO dto) {
    if (dto.quantidade() == null || dto.quantidade() < 0) {
        return ResponseEntity.badRequest()
                .body("Campo 'quantidade' é obrigatório (inteiro ≥ 0).");
    }
    service.atualizarQuantidade(id, dto.quantidade());
    return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/quantidade")
    public ResponseEntity<?> atualizarQuantidade(@PathVariable Long id,
                                             @RequestBody Map<String, Object> body) {
    Integer qtd;
    try {
        Object v = body.get("quantidade");
        if (v == null) throw new IllegalArgumentException();
        qtd = (v instanceof Number) ? ((Number) v).intValue() : Integer.valueOf(String.valueOf(v));
        if (qtd < 0) throw new IllegalArgumentException();
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Campo 'quantidade' é obrigatório (inteiro ≥ 0).");
    }
    service.atualizarQuantidade(id, qtd);
    return ResponseEntity.noContent().build();
}
}

