package projeto.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.UsuarioCreateDTO;
import projeto.ecommerce.dto.UsuarioUpdateDTO;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.service.UsuarioService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService service;

    @PostMapping
    public ResponseEntity<Usuario> criar(@Valid @RequestBody UsuarioCreateDTO dto) {
        Usuario u = service.criar(dto);
        return ResponseEntity.created(URI.create("/api/usuarios/" + u.getId())).body(u);
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listar(@RequestParam(name = "nome", required = false) String nome) {
        return ResponseEntity.ok(service.listar(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id,
                                             @Valid @RequestBody UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Usuario> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(service.alternarStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
