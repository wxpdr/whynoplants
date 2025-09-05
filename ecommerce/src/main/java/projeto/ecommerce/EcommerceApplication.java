package projeto.ecommerce;

import projeto.ecommerce.controller.LoginController;
import projeto.ecommerce.model.Usuario;  // Importando a classe correta
import projeto.ecommerce.repository.UsuarioRepository;

public class EcommerceApplication {

    public static void main(String[] args) {
        // Inicializa o repositório (no caso, estamos simulando a persistência em memória)
        UsuarioRepository usuarioRepository = new UsuarioRepository();

        // Adicionando alguns usuários para testar
        usuarioRepository.cadastrarUsuario(new Usuario("teste@teste.com", "1234", true, "Administrador"));
        usuarioRepository.cadastrarUsuario(new Usuario("admin@admin.com", "admin@admin.com", true, "Administrador"));

        // Inicia o controller de login
        LoginController loginController = new LoginController(usuarioRepository);
        loginController.showLogin();
    }
}
