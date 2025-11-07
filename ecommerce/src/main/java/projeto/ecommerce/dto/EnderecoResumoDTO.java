package projeto.ecommerce.dto;

public record EnderecoResumoDTO(
        Long id,
        String cep,          // já formatado 12345-678
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        boolean padrao       // por enquanto false (a não ser que você tenha o campo na entidade)
) {}
