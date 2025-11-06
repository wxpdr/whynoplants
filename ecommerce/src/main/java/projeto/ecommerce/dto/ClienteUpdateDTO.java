package projeto.ecommerce.dto;

import projeto.ecommerce.model.Genero;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ClienteUpdateDTO(
        @NotBlank @Size(min=3) String primeiroNome,
        @NotBlank @Size(min=3) String sobrenome,
        @NotNull @Past LocalDate dataNascimento,
        @NotNull Genero genero
) { }