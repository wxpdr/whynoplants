package projeto.ecommerce.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ecommerce.dto.LoginRequest;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.model.Cliente;
import projeto.ecommerce.repository.ClienteRepository;
import projeto.ecommerce.service.SecurityService;
import projeto.ecommerce.service.UsuarioService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarios;
    private final SecurityService security;
    private final ClienteRepository clientes; // <-- novo

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        String email = req.email().trim().toLowerCase();
        String senha = req.senha();

        // 1) Tenta USUÁRIO (Admin / Estoquista)
        Usuario u = usuarios.buscarPorEmail(email);
        if (u != null && u.isAtivo() && security.checkPassword(senha, u.getSenha())) {
            session.setAttribute("USER_ID", u.getId());
            session.setAttribute("USER_PERFIL", u.getPerfil()); // "Administrador" | "Estoquista"
            session.setAttribute("USER_NOME", u.getNome());

            Map<String,Object> payload = new HashMap<>();
            payload.put("id", u.getId());
            payload.put("perfil", u.getPerfil());
            payload.put("nome", u.getNome());
            payload.put("redirect", "Administrador".equals(u.getPerfil())
                    ? "principal.html"
                    : "principal-estoque.html");
            return ResponseEntity.ok(payload);
        }

        // 2) Tenta CLIENTE
        var cOpt = clientes.findByEmail(email);
        if (cOpt.isPresent()) {
            Cliente c = cOpt.get();
            // campo do Cliente é senhaHash
            if (security.checkPassword(senha, c.getSenhaHash())) {
                session.setAttribute("USER_ID", c.getId());
                session.setAttribute("USER_PERFIL", "Cliente");
                session.setAttribute("USER_NOME", c.getNomeCompleto());

                Map<String,Object> payload = new HashMap<>();
                payload.put("id", c.getId());
                payload.put("perfil", "Cliente");
                payload.put("nome", c.getNomeCompleto());
                payload.put("redirect", "principal-cliente.html");
                return ResponseEntity.ok(payload);
            }
        }

        // 3) Falhou
        return ResponseEntity.status(401).body("Credenciais inválidas");
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

    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(HttpSession session){
        Object id = session.getAttribute("USER_ID");
        if(id == null) return ResponseEntity.status(401).build();
        var out = new java.util.HashMap<String,Object>();
        out.put("id", id);
        out.put("perfil", session.getAttribute("USER_PERFIL"));
        out.put("nome", session.getAttribute("USER_NOME"));
        return ResponseEntity.ok(out);
    }
}
