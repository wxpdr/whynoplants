package projeto.ecommerce.util.viacep;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ViaCepClient {

    private final RestTemplate http;

    public ViaCepClient(RestTemplate http) {
        this.http = http;
    }

    public ViaCepResponse buscar(String cep) {
        String url = "https://viacep.com.br/ws/" + cep.replaceAll("\\D","") + "/json/";
        return http.getForObject(url, ViaCepResponse.class);
    }

    public record ViaCepResponse(String cep, String logradouro, String complemento,
                                 String bairro, String localidade, String uf, Boolean erro) {}
}
