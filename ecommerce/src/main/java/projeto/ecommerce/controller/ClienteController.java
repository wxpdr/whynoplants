package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.*;
import projeto.ecommerce.service.ClienteService;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;

    @PostMapping
    public ResponseEntity<ClienteResumoDTO> criar(@RequestBody @Valid ClienteCreateDTO dto) {
        var resumo = service.criar(dto);
        // critério: após cadastro, redirecionar para login (front faz o redirect)
        return ResponseEntity.created(URI.create("/login.html")).body(resumo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizarPerfil(@PathVariable Long id,
                                                @RequestBody @Valid ClienteUpdateDTO dto,
                                                HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID"); // já existe no teu login
        service.atualizarPerfil(id, dto, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable Long id,
                                             @RequestBody @Valid AlterarSenhaDTO dto,
                                             HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        service.alterarSenha(id, dto, userId);
        return ResponseEntity.noContent().build();
    }
}