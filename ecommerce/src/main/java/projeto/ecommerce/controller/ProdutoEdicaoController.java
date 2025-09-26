package projeto.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import projeto.ecommerce.dto.ProdutoDetalheDTO;
import projeto.ecommerce.dto.ProdutoUpdateRequest;
import projeto.ecommerce.service.ProdutoEdicaoService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoEdicaoController {

    private final ProdutoEdicaoService service;

    @GetMapping("/{id}/detalhe")
    public ProdutoDetalheDTO detalhar(@PathVariable Long id){
        return service.detalhar(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoUpdateRequest req){
        service.atualizar(id, req);
        return ResponseEntity.noContent().build();
    }

    // <<< CORRIGIDO: @RequestParam em vez de @RequestPart
    @PostMapping(value="/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> adicionarImagens(
            @PathVariable Long id,
            @RequestParam("imagens") List<MultipartFile> imagens,
            @RequestParam(value="principalIndex", required=false) Integer principalIndex
    ) throws IOException {
        service.adicionarImagens(id, imagens, principalIndex);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/imagens/{imgId}/principal")
    public ResponseEntity<?> setPrincipal(@PathVariable Long id, @PathVariable Long imgId){
        service.tornarPrincipal(id, imgId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/imagens/{imgId}")
    public ResponseEntity<?> removerImagem(@PathVariable Long id, @PathVariable Long imgId){
        service.removerImagem(id, imgId);
        return ResponseEntity.noContent().build();
    }
}
