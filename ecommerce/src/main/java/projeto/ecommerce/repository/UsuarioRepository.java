package projeto.ecommerce.repository;

import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.service.SecurityService;

import java.util.ArrayList;
import java.util.List;

public class UsuarioRepository {

    // Lista simulando um banco de dados
    private static List<Usuario> usuarios = new ArrayList<>();
    private SecurityService securityService;

    public UsuarioRepository() {
        this.securityService = new SecurityService(); // Inicializando o serviço de segurança
    }

    // Método para cadastrar usuário
    public void cadastrarUsuario(Usuario usuario) {
        // Criptografando a senha antes de adicionar ao repositório
        String encryptedPassword = securityService.encryptPassword(usuario.getSenha());
        usuario.setSenha(encryptedPassword);  // Atualizando a senha com a criptografada
        usuarios.add(usuario);
    }

    // Método para verificar se o email já está cadastrado
    public boolean emailExiste(String email) {
        return usuarios.stream().anyMatch(u -> u.getEmail().equals(email));
    }

    // Método para autenticar usuário
    public boolean autenticarUsuario(String email, String senha) {
        // Verificando se o email existe
        Usuario usuario = findByEmail(email); // Chamando o método findByEmail para buscar o usuário

        if (usuario != null) {
            // Verificando se a senha fornecida corresponde à senha criptografada no banco
            return securityService.checkPassword(senha, usuario.getSenha());
        }
        return false;
    }

    // Método para encontrar usuário pelo email
    public Usuario findByEmail(String email) {
        return usuarios.stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElse(null); // Retorna null se o usuário não for encontrado
    }

    // Método para listar todos os usuários
    public List<Usuario> findAll() {
        return usuarios;
    }
}
