package projeto.ecommerce.dto;

import projeto.ecommerce.model.Genero;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record ClienteCreateDTO(
        @Email @NotBlank String email,
        @NotBlank @Size(min=6, max=64) String senha,
        @NotBlank @Size(min=3) String primeiroNome,
        @NotBlank @Size(min=3) String sobrenome,
        @NotBlank @Pattern(regexp="\\d{11}") String cpf,
        @NotNull @Past LocalDate dataNascimento,
        @NotNull Genero genero,
        @NotNull @Size(min=1) List<@Valid EnderecoDTO> enderecos,
        boolean copiarEnderecoEntrega
) { }