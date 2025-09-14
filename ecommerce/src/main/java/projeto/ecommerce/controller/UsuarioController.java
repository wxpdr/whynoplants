package projeto.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.UsuarioCreateDTO;
import projeto.ecommerce.dto.UsuarioUpdateDTO;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService service;

    @GetMapping
    public List<Usuario> listar(@RequestParam(required = false) String nome){
        return service.listar(nome);
    }

    @PostMapping
    public Usuario criar(@RequestBody @Valid UsuarioCreateDTO dto){
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public Usuario atualizar(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateDTO dto){
        return service.atualizar(id, dto);
    }

    @PatchMapping("/{id}/toggle")
    public Usuario alternar(@PathVariable Long id){
        return service.alternarStatus(id);
    }
}
