package projeto.ecommerce.dto;

import projeto.ecommerce.model.Genero;
import java.time.LocalDate;

public record ClienteBasicoDTO(
        String primeiroNome,
        String sobrenome,
        LocalDate dataNascimento,
        Genero genero
) {}
