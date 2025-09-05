package projeto.ecommerce.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class SecurityService {

    private final PasswordEncoder passwordEncoder;

    public SecurityService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Criptografa a senha
    public String encryptPassword(String password) {
        return passwordEncoder.encode(password);
    }

    // Verifica se a senha digitada confere com o hash armazenado
    public boolean checkPassword(String rawPassword, String encryptedPassword) {
        return passwordEncoder.matches(rawPassword, encryptedPassword);
    }
}
