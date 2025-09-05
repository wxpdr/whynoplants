package projeto.ecommerce.controller;

import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;
import projeto.ecommerce.service.SecurityService;  // Adicionando a dependência do serviço de segurança

import java.util.Scanner;

public class LoginController {

    private UsuarioRepository usuarioRepository;
    private SecurityService securityService;  // Instância para criptografia de senha

    public LoginController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.securityService = new SecurityService();  // Inicializando o serviço de segurança
    }

    public void showLogin() {
        Scanner scanner = new Scanner(System.in); // Instanciando o scanner para a leitura de entradas no terminal

        try {
            System.out.println("Por favor, digite seu email:");
            String email = scanner.nextLine();
            System.out.println("Digite sua senha:");
            String senha = scanner.nextLine();

            Usuario usuario = usuarioRepository.findByEmail(email);

            if (usuario != null && securityService.checkPassword(senha, usuario.getSenha()) && usuario.isAtivo()) { 
                // Usando o método checkPassword para comparar a senha fornecida com a senha criptografada
                System.out.println("Login bem-sucedido!");
                showDashboard(usuario);
            } else {
                System.out.println("Email ou senha incorretos, ou usuário inativo.");
            }
        } finally {
            // scanner.close();  // Não fechamos aqui para evitar fechamento de System.in
        }
    }

    public void showDashboard(Usuario usuario) {
        Scanner scanner = new Scanner(System.in);

        try {
            System.out.println("\nBem-vindo ao sistema, " + usuario.getEmail() + "!");
            System.out.println("Selecione uma opção:");
            System.out.println("1. Listar Usuários");
            System.out.println("2. Sair");

            int escolha = scanner.nextInt();

            switch (escolha) {
                case 1:
                    listarUsuarios();
                    break;
                case 2:
                    System.out.println("Saindo...");
                    System.exit(0);
                    break;
                default:
                    System.out.println("Opção inválida.");
            }
        } finally {
            // scanner.close();  // Não fechamos o scanner aqui também para evitar fechar System.in
        }
    }

    public void listarUsuarios() {
        // Vamos listar os usuários do banco (somente exemplo básico)
        System.out.println("\nLista de Usuários:");
        for (Usuario usuario : usuarioRepository.findAll()) {
            System.out.println("ID: " + usuario.getId() + ", Email: " + usuario.getEmail() + ", Status: " + (usuario.isAtivo() ? "Ativo" : "Inativo"));
        }
    }
}
