package projeto.ecommerce.dto;

public record EnderecoDetalheDTO(
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String uf
) {}