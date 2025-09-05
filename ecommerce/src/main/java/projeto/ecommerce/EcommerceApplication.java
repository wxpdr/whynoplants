package projeto.ecommerce;

import projeto.ecommerce.controller.LoginController;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;
import projeto.ecommerce.service.SecurityService;

public class EcommerceApplication {

    public static void main(String[] args) {
        UsuarioRepository usuarioRepository = new UsuarioRepository();
        SecurityService securityService = new SecurityService();

        // Cadastrando usuários com senha simples, criptografando uma vez
        Usuario usuario1 = new Usuario("teste@teste.com", securityService.encryptPassword("1234"), true, "Administrador");
        usuarioRepository.cadastrarUsuario(usuario1);

        Usuario usuario2 = new Usuario("admin@admin.com", securityService.encryptPassword("123456"), true, "Administrador");
        usuarioRepository.cadastrarUsuario(usuario2);

        // Inicializa o loginController
        LoginController loginController = new LoginController(usuarioRepository, securityService);
        loginController.showLogin();
    }
}
