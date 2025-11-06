package projeto.ecommerce.util.viacep;

// mapeia o JSON do ViaCEP
public record ViaCepResponse(
        String cep, String logradouro, String complemento, String bairro,
        String localidade, String uf, Boolean erro
) { }