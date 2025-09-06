package projeto.ecommerce.repository;

import projeto.ecommerce.model.Usuario;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UsuarioRepository {

    private Connection connection;

    // Construtor que cria a conexão com o banco de dados
    public UsuarioRepository() {
        try {
            // Estabelece a conexão com o banco de dados
            this.connection = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/wnplants", 
                "root", 
                "130500"
            );
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Método para cadastrar um usuário
    public void cadastrarUsuario(Usuario usuario) {
        try {
            String sql = "INSERT INTO usuarios (email, nome, cpf, grupo, senha, status) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, usuario.getEmail());
            statement.setString(2, usuario.getNome());
            statement.setString(3, usuario.getCpf());
            statement.setString(4, usuario.getPerfil());
            statement.setString(5, usuario.getSenha());
            statement.setBoolean(6, usuario.isAtivo());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Método para listar todos os usuários
    public List<Usuario> findAll() {
        List<Usuario> usuarios = new ArrayList<>();
        try {
            String sql = "SELECT id_usuario, nome, cpf, email, senha, status, grupo, data_criacao FROM usuarios WHERE 1";
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            while (resultSet.next()) {
                Usuario usuario = new Usuario(
                    resultSet.getString("email"),
                    resultSet.getString("senha"),
                    "ativo".equals(resultSet.getString("status")),
                    resultSet.getString("grupo")
                );
                usuario.setId(resultSet.getInt("id_usuario"));
                usuario.setNome(resultSet.getString("nome"));
                usuario.setCpf(resultSet.getString("cpf"));
                usuario.setDataCriacao(resultSet.getTimestamp("data_criacao"));
                usuarios.add(usuario);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return usuarios;
    }

    // Método para encontrar um usuário pelo email
    public Usuario findByEmail(String email) {
        Usuario usuario = null;
        try {
            String sql = "SELECT * FROM usuarios WHERE email = ?";
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                usuario = new Usuario(
                    resultSet.getString("email"),
                    resultSet.getString("senha"),
                    "ativo".equals(resultSet.getString("status")),
                    resultSet.getString("grupo")
                );
                usuario.setId(resultSet.getInt("id_usuario"));
                usuario.setNome(resultSet.getString("nome"));
                usuario.setCpf(resultSet.getString("cpf"));
                usuario.setDataCriacao(resultSet.getTimestamp("data_criacao"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return usuario;
    }

    // Método para atualizar um usuário no banco
    public void atualizarUsuario(Usuario usuario) {
        try {
            String sql = "UPDATE usuarios SET nome = ?, cpf = ?, grupo = ?, status = ? WHERE email = ?";
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, usuario.getNome());
            statement.setString(2, usuario.getCpf());
            statement.setString(3, usuario.getPerfil());
            statement.setBoolean(4, usuario.isAtivo());
            statement.setString(5, usuario.getEmail());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
