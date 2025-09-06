package projeto.ecommerce;

import projeto.ecommerce.controller.LoginController;
//import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;
import projeto.ecommerce.service.SecurityService;

public class EcommerceApplication {

    public static void main(String[] args) {
        // Inicializa os repositórios e serviços
        UsuarioRepository usuarioRepository = new UsuarioRepository();
        SecurityService securityService = new SecurityService();

        // Cadastra o usuário administrador com a senha "123456", que será criptografada
        // Usuario usuario1 = new Usuario("teste@teste.com", securityService.encryptPassword("teste123"), true, "Estoquista");
        // usuario1.setNome("Teste"); // Defina um nome para o usuário
        // usuario1.setCpf("12345678901"); // Defina um CPF para o usuário
        // usuarioRepository.cadastrarUsuario(usuario1); // Usuário admin cadastrado

        // System.out.println("Usuário administrador cadastrado com sucesso!");

        // Inicializa o LoginController
        LoginController loginController = new LoginController(usuarioRepository, securityService);
        
        // Chama a função para fazer login
        loginController.showLogin();  // Aqui você vai fazer login com a senha simples "123456"
    }
}
