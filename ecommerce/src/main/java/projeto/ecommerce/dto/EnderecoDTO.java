package projeto.ecommerce.dto;

import projeto.ecommerce.model.TipoEndereco;

public record EnderecoDTO(
    String cep,
    String logradouro,
    String bairro,
    String cidade,
    String uf,
    String numero,
    String complemento,
    TipoEndereco tipo
) {}
