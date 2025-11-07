package projeto.ecommerce.dto;

import java.time.LocalDate;
import java.util.List;
import projeto.ecommerce.model.Genero;

public record ClienteCreateDTO(
    String primeiroNome,
    String sobrenome,
    String email,
    String senha,
    String cpf,
    LocalDate dataNascimento,
    Genero genero,
    List<EnderecoDTO> enderecos,
    boolean copiarEnderecoEntrega
) {}
