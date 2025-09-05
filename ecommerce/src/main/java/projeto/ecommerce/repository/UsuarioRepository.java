package projeto.ecommerce.repository;

import projeto.ecommerce.model.Usuario;
import java.util.ArrayList;
import java.util.List;

public class UsuarioRepository {

    private final List<Usuario> usuarios = new ArrayList<>();

    public void cadastrarUsuario(Usuario usuario) {
        usuarios.add(usuario);
        System.out.println("Usuário cadastrado com sucesso!");
    }

    public Usuario findByEmail(String email) {
        return usuarios.stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }

    public List<Usuario> findAll() {
        return usuarios;
    }
}
