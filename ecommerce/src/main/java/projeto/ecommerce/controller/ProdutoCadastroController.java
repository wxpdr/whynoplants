// src/main/java/projeto/ecommerce/controller/ProdutoCadastroController.java
package projeto.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import projeto.ecommerce.dto.ProdutoCreateRequest;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.service.ProdutoCadastroService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoCadastroController {
    private final ProdutoCadastroService service;

    // Cria produto + imagens
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produto> criar(
        @Valid @RequestPart("dados") ProdutoCreateRequest dados,
        @RequestPart(name="imagens", required=false) List<MultipartFile> imagens
    ) throws IOException {
        var novo = service.criar(dados, imagens);
        return ResponseEntity.ok(novo);
    }
}
