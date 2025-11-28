package projeto.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;

import projeto.ecommerce.model.Genero;

public record ClienteCreateDTO(
        @NotBlank(message = "Primeiro nome é obrigatório")
        @Size(min = 3, message = "Primeiro nome deve ter pelo menos 3 letras")
        String primeiroNome,

        @NotBlank(message = "Sobrenome é obrigatório")
        @Size(min = 3, message = "Sobrenome deve ter pelo menos 3 letras")
        String sobrenome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
        String senha,

        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        String cpf,


        @NotNull(message = "Data de nascimento é obrigatória")
        @Past(message = "Data de nascimento deve ser no passado")
        LocalDate dataNascimento,

        @NotNull(message = "Gênero é obrigatório")
        Genero genero,

        @NotNull(message = "Informe pelo menos um endereço")
        @Valid
        List<EnderecoDTO> enderecos,

        boolean copiarEnderecoEntrega
) {}
