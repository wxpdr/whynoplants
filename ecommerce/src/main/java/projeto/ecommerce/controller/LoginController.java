package projeto.ecommerce.controller;

import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;
import projeto.ecommerce.service.SecurityService;

import java.util.Scanner;

public class LoginController {

    private final UsuarioRepository usuarioRepository;
    private final SecurityService securityService;

    public LoginController(UsuarioRepository usuarioRepository, SecurityService securityService) {
        this.usuarioRepository = usuarioRepository;
        this.securityService = securityService;
    }

    public void showLogin() {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Por favor, digite seu email:");
        String email = scanner.nextLine();

        System.out.println("Digite sua senha:");
        String senha = scanner.nextLine();

        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            boolean confere = securityService.checkPassword(senha, usuario.getSenha());
            System.out.println("[DEBUG] Senha digitada: " + senha);
            System.out.println("[DEBUG] Hash armazenado: " + usuario.getSenha());
            System.out.println("[DEBUG] Senha confere? " + confere);

            if (confere && usuario.isAtivo()) {
                System.out.println("Login bem-sucedido!");
                showDashboard(usuario);
            } else {
                System.out.println("Email ou senha incorretos, ou usuário inativo.");
            }
        } else {
            System.out.println("Usuário não encontrado.");
        }
    }

    private void showDashboard(Usuario usuario) {
        Scanner scanner = new Scanner(System.in);

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
    }

    private void listarUsuarios() {
        System.out.println("\nLista de Usuários:");
        for (Usuario u : usuarioRepository.findAll()) {
            System.out.println("Email: " + u.getEmail() + ", Status: " + (u.isAtivo() ? "Ativo" : "Inativo"));
        }
    }
}
