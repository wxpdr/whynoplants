package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import projeto.ecommerce.dto.AlterarSenhaDTO;
import projeto.ecommerce.dto.ClienteBasicoDTO;
import projeto.ecommerce.dto.ClienteCreateDTO;
import projeto.ecommerce.dto.ClienteResumoDTO;
import projeto.ecommerce.dto.ClienteUpdateDTO;
import projeto.ecommerce.dto.EnderecoDTO;
import projeto.ecommerce.dto.EnderecoResumoDTO;

import projeto.ecommerce.service.ClienteService;
import projeto.ecommerce.util.viacep.ViaCepResponse;
import projeto.ecommerce.util.viacep.ViaCepService;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;
    private final ViaCepService viaCep;

    /* -------------------- Público -------------------- */

    /** ViaCEP proxy para auto-preencher endereço */
    @GetMapping("/viacep/{cep}")
    public ResponseEntity<?> viaCep(@PathVariable String cep) {
        ViaCepResponse r = viaCep.buscar(cep.replaceAll("\\D", ""));
        if (r == null || Boolean.TRUE.equals(r.erro())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(r);
    }

    /** Cadastro do cliente (retorna 201 + Location /login.html) */
    @PostMapping("/criar")
    public ResponseEntity<ClienteResumoDTO> criar(@Valid @RequestBody ClienteCreateDTO dto) {
        ClienteResumoDTO resumo = service.criar(dto);
        return ResponseEntity
                .created(URI.create("/login.html"))
                .body(resumo);
    }


    /* -------------------- Requer sessão do cliente -------------------- */

    /** Dados básicos para preencher telas do cliente */
    @GetMapping("/{id}")
    public ResponseEntity<ClienteBasicoDTO> getBasico(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        return ResponseEntity.ok(service.getBasico(id, userId));
    }

    /** Lista endereços de ENTREGA do cliente (somente leitura na principal) */
    @GetMapping("/{id}/enderecos")
    public ResponseEntity<List<EnderecoResumoDTO>> listarEnderecos(
            @PathVariable Long id,
            @RequestParam(defaultValue = "ENTREGA") String tipo, // reservado p/ futuro
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");
        return ResponseEntity.ok(service.listarEnderecosEntrega(id, userId));
    }

     /** Adiciona um novo endereço de ENTREGA para o cliente logado */
    @PostMapping("/{id}/enderecos")
    public ResponseEntity<Void> adicionarEndereco(@PathVariable Long id,
                                                  @RequestBody EnderecoDTO dto,
                                                  HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        service.adicionarEnderecoEntrega(id, dto, userId);
        return ResponseEntity.noContent().build();
    }

    /** Atualiza dados pessoais (nome, data, gênero) */
    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizarPerfil(@PathVariable Long id,
                                                @Valid @RequestBody ClienteUpdateDTO dto,
                                                HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        service.atualizarPerfil(id, dto, userId);
        return ResponseEntity.noContent().build();
    }

    /** Altera a senha do cliente logado */
    @PutMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable Long id,
                                             @Valid @RequestBody AlterarSenhaDTO dto,
                                             HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        service.alterarSenha(id, dto, userId);
        return ResponseEntity.noContent().build();
    }

       @PutMapping("/enderecos/{enderecoId}/padrao")
    public ResponseEntity<Void> tornarEnderecoPadrao(@PathVariable Long enderecoId,
                                                 HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        service.tornarEnderecoPadrao(enderecoId, userId);
        return ResponseEntity.noContent().build();
    }

}
