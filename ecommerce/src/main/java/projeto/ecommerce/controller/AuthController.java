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

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarios;
    private final SecurityService security;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        Usuario u = usuarios.buscarPorEmail(req.email());
        if (u == null) return ResponseEntity.status(401).body("Credenciais inválidas");
        if (!u.isAtivo()) return ResponseEntity.status(403).body("Usuário desativado");
        if (!security.checkPassword(req.senha(), u.getSenha())) return ResponseEntity.status(401).body("Credenciais inválidas");

        session.setAttribute("USER_ID", u.getId());
        session.setAttribute("USER_PERFIL", u.getPerfil());
        session.setAttribute("USER_NOME", u.getNome());

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("id", u.getId());
        payload.put("perfil", u.getPerfil()); // "Administrador" | "Estoquista"
        payload.put("nome", u.getNome());
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Object id = session.getAttribute("USER_ID");
        if (id == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(id);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }
}
