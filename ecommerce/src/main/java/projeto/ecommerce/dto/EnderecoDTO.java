package projeto.ecommerce.dto;

import projeto.ecommerce.model.TipoEndereco;
import jakarta.validation.constraints.*;

public record EnderecoDTO(
        @NotNull TipoEndereco tipo,
        @NotBlank @Pattern(regexp="\\d{8}") String cep,
        @NotBlank String logradouro,
        @NotBlank String bairro,
        @NotBlank String cidade,
        @NotBlank @Size(min=2,max=2) String uf,
        @NotBlank String numero,
        String complemento
) { }