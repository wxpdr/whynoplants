package projeto.ecommerce.repository;

import projeto.ecommerce.model.Usuario;

import java.util.ArrayList;
import java.util.List;

public class UsuarioRepository {

    // Lista simulando um banco de dados
    private static List<Usuario> usuarios = new ArrayList<>();

    // Método para cadastrar usuário
    public void cadastrarUsuario(Usuario usuario) {
        usuarios.add(usuario);
    }

    // Método para verificar se o email já está cadastrado
    public boolean emailExiste(String email) {
        for (Usuario usuario : usuarios) {
            if (usuario.getEmail().equals(email)) {
                return true;
            }
        }
        return false;
    }

    // Método para buscar o usuário pelo email
    public Usuario findByEmail(String email) {
        for (Usuario usuario : usuarios) {
            if (usuario.getEmail().equals(email)) {
                return usuario;
            }
        }
        return null;
    }

    // Método para listar todos os usuários
    public List<Usuario> findAll() {
        return usuarios;
    }
}
