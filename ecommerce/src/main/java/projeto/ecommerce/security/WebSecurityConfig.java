package projeto.ecommerce.security;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class WebSecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // estáticos (css/js/img) nas pastas padrão: /static, /public, ...
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                // páginas soltas (sem usar /**/*.html)
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/index.html", "/produto-visualizar.html", "/produto-visualizar-cliente.html", "/css/**", "/js/**").permitAll()
                .requestMatchers("/", "/index.html", "/login.html", "/principal.html", "/usuarios.html").permitAll()

                // endpoints públicos para iniciar (cadastro + login)
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                .requestMatchers(HttpMethod.POST, "/login").permitAll()

                // TODO: depois troque para .authenticated()
                .anyRequest().permitAll()
            )
            .formLogin(form -> form.disable());
        return http.build();
    }
}
