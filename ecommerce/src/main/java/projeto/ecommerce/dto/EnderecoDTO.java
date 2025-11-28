package projeto.ecommerce.dto;

import jakarta.validation.constraints.*;
import projeto.ecommerce.model.TipoEndereco;

public record EnderecoDTO(
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{8}", message = "CEP inválido")
        String cep,

        @NotBlank(message = "Logradouro é obrigatório")
        String logradouro,

        @NotBlank(message = "Bairro é obrigatório")
        String bairro,

        @NotBlank(message = "Cidade é obrigatória")
        String cidade,

        @NotBlank(message = "UF é obrigatória")
        @Size(min = 2, max = 2, message = "UF deve ter 2 letras")
        String uf,

        @NotBlank(message = "Número é obrigatório")
        String numero,

        String complemento,

        @NotNull(message = "Tipo do endereço é obrigatório")
        TipoEndereco tipo
) {}
