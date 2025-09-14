package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.LoginRequest;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.service.SecurityService;
import projeto.ecommerce.service.UsuarioService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final SecurityService security;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest body, HttpSession session){
        Usuario u = usuarioService.buscarPorEmail(body.email());
        if(u==null || !u.isAtivo()) return ResponseEntity.status(401).body("Credenciais inválidas");
        if(!security.checkPassword(body.senha(), u.getSenha())) return ResponseEntity.status(401).body("Credenciais inválidas");

        session.setAttribute("USER_EMAIL", u.getEmail());
        session.setAttribute("USER_GROUP", u.getPerfil());
        return ResponseEntity.ok(Map.of("nome", u.getNome(), "perfil", u.getPerfil()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session){
        Object email = session.getAttribute("USER_EMAIL");
        Object perfil = session.getAttribute("USER_GROUP");
        if(email==null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("email", email, "perfil", perfil));
    }

    @PostMapping("/logout")
    public void logout(HttpSession session){
        session.invalidate();
    }
}
