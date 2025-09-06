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
        this.securityService = securityService;  // Inicializando o serviço de segurança
    }

    // Método para autenticar login
    public void showLogin() {
        Scanner scanner = new Scanner(System.in); // Instanciando o scanner para a leitura de entradas no terminal

        System.out.println("Por favor, digite seu email:");
        String email = scanner.nextLine();

        System.out.println("Digite sua senha:");
        String senha = scanner.nextLine();

        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            boolean confere = securityService.checkPassword(senha, usuario.getSenha());
            // System.out.println("[DEBUG] Senha digitada: " + senha);
            // System.out.println("[DEBUG] Hash armazenado: " + usuario.getSenha());
            // System.out.println("[DEBUG] Senha confere? " + confere);

            if (confere && usuario.isAtivo()) {
                System.out.println("Login bem-sucedido!");
                showDashboard(usuario);  // Mostra o dashboard após login
            } else {
                System.out.println("Email ou senha incorretos, ou usuário inativo.");
            }
        } else {
            System.out.println("Usuário não encontrado.");
        }
    }

    // Método para exibir o dashboard do usuário
    private void showDashboard(Usuario usuario) {
        Scanner scanner = new Scanner(System.in);
        boolean sair = false;

        while (!sair) {
            System.out.println("\nBem-vindo ao sistema, " + usuario.getEmail() + "!");
            System.out.println("Selecione uma opção:");
            System.out.println("1. Cadastrar Novo Usuário");
            System.out.println("2. Listar Usuários");
            System.out.println("3. Editar Usuário");
            System.out.println("4. Sair");

            int escolha = scanner.nextInt();
            scanner.nextLine();  // Limpar o buffer do scanner

            switch (escolha) {
                case 1:
                    cadastrarUsuario();  // Chama o método de cadastro
                    break;
                case 2:
                    listarUsuarios();
                    break;
                case 3:
                    editarUsuario();  // Nova opção para editar o usuário
                    break;
                case 4:
                    System.out.println("Saindo...");
                    sair = true;
                    break;
                default:
                    System.out.println("Opção inválida.");
            }
        }
    }

    // Método para listar os usuários cadastrados
    private void listarUsuarios() {
        System.out.println("\nLista de Usuários:");
        for (Usuario u : usuarioRepository.findAll()) {
            System.out.println("Email: " + u.getEmail() + ", Status: " + (u.isAtivo() ? "Ativo" : "Inativo"));
        }
    }

    // Método para editar um usuário
    private void editarUsuario() {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Digite o email do usuário que deseja editar:");
        String email = scanner.nextLine();

        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            System.out.println("Usuário encontrado: " + usuario.getEmail());
            System.out.println("Digite o novo nome (deixe em branco para manter o atual):");
            String nome = scanner.nextLine();
            if (!nome.isEmpty()) {
                usuario.setNome(nome);
            }

            System.out.println("Digite o novo CPF (deixe em branco para manter o atual):");
            String cpf = scanner.nextLine();
            if (!cpf.isEmpty()) {
                usuario.setCpf(cpf);
            }

            System.out.println("Digite o novo grupo (deixe em branco para manter o atual):");
            String grupo = scanner.nextLine();
            if (!grupo.isEmpty()) {
                usuario.setPerfil(grupo);
            }

            System.out.println("Digite o novo status (ativo/inativo, deixe em branco para manter o atual):");
            String status = scanner.nextLine();
            if (!status.isEmpty()) {
                usuario.setAtivo(status.equalsIgnoreCase("ativo"));
            }

            usuarioRepository.atualizarUsuario(usuario);  // Atualiza o usuário no banco
            System.out.println("Usuário atualizado com sucesso!");
        } else {
            System.out.println("Usuário não encontrado.");
        }
    }

    // Método para cadastrar um novo usuário
    private void cadastrarUsuario() {
        Scanner scanner = new Scanner(System.in);

        // Solicitar dados para o novo usuário
        System.out.println("Digite o e-mail do novo usuário:");
        String email = scanner.nextLine();

        System.out.println("Digite o nome do novo usuário:");
        String nome = scanner.nextLine(); // Certifique-se de que está capturando o nome corretamente

        System.out.println("Digite o CPF do novo usuário:");
        String cpf = scanner.nextLine(); // Captura o CPF

        // Verificar se o CPF tem exatamente 11 caracteres
        if (cpf == null || cpf.trim().isEmpty() || cpf.length() != 11) {
            System.out.println("O CPF deve ter exatamente 11 caracteres. Tente novamente.");
            return;
        }

        System.out.println("Digite o grupo do novo usuário (Administrador/Estoquista):");
        String grupo = scanner.nextLine();

        System.out.println("Digite a senha do novo usuário:");
        String senha = scanner.nextLine();

        // Confirmação de senha
        System.out.println("Digite novamente a senha:");
        String senhaConfirmada = scanner.nextLine();

        if (!senha.equals(senhaConfirmada)) {
            System.out.println("As senhas não coincidem. Tente novamente.");
            return;
        }

        // Criptografa a senha antes de salvar
        String senhaCriptografada = securityService.encryptPassword(senha);

        // Cria um novo usuário e o cadastra no sistema
        Usuario usuario = new Usuario(email, senhaCriptografada, true, grupo);
        usuario.setNome(nome); // Defina o nome do usuário
        usuario.setCpf(cpf); // Defina o CPF do usuário
        usuarioRepository.cadastrarUsuario(usuario);

        System.out.println("Usuário cadastrado com sucesso!");
    }
}
