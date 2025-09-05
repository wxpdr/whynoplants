package projeto.ecommerce.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class SecurityService {

    private final PasswordEncoder passwordEncoder;

    // Construtor da classe
    public SecurityService() {
        this.passwordEncoder = new BCryptPasswordEncoder(); // Inicializando o encoder para criptografia
    }

    // Método para criptografar a senha
    public String encryptPassword(String password) {
        return passwordEncoder.encode(password);
    }

    // Método para verificar a senha
    public boolean checkPassword(String rawPassword, String encryptedPassword) {
        return passwordEncoder.matches(rawPassword, encryptedPassword);
    }
}
