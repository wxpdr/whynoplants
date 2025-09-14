package projeto.ecommerce.security;

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
                  .requestMatchers("/", "/index.html", "/login",
                                   "/css/**", "/js/**", "/**/*.html").permitAll()
                  // liberar só o 1º cadastro
                  .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                  .requestMatchers("/api/usuarios/**").authenticated()
                  .anyRequest().authenticated()
          )
          .formLogin(form -> form.disable())
          .logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/"));
        return http.build();
    }
}
  