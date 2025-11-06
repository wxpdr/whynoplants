package projeto.ecommerce.util.viacep;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {
    private final RestTemplate rest = new RestTemplate();

    public ViaCepResponse buscar(String cep8) {
        String url = "https://viacep.com.br/ws/" + cep8 + "/json/";
        ResponseEntity<ViaCepResponse> resp = rest.getForEntity(url, ViaCepResponse.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new IllegalArgumentException("CEP inválido ou serviço indisponível.");
        }
        if (Boolean.TRUE.equals(resp.getBody().erro())) {
            throw new IllegalArgumentException("CEP não encontrado.");
        }
        return resp.getBody();
    }
}