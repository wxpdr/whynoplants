package projeto.ecommerce.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import projeto.ecommerce.dto.*;
import projeto.ecommerce.model.Cliente;
import projeto.ecommerce.model.Endereco;
import projeto.ecommerce.model.Genero;
import projeto.ecommerce.model.TipoEndereco;
import projeto.ecommerce.repository.ClienteRepository;
import projeto.ecommerce.repository.EnderecoRepository;
import projeto.ecommerce.util.viacep.ViaCepResponse;
import projeto.ecommerce.util.viacep.ViaCepService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepo;
    private final EnderecoRepository endRepo;
    private final PasswordEncoder encoder;
    private final ViaCepService viaCep;

    /* ===================== CADASTRO ===================== */

    @Transactional
    public ClienteResumoDTO criar(ClienteCreateDTO dto) {
        // email único (normalizado)
        String emailNorm = req(dto.email(), "E-mail").trim().toLowerCase();
        if (clienteRepo.existsByEmail(emailNorm))
            throw new IllegalArgumentException("Email já cadastrado.");

        // cpf único (apenas dígitos)
        String cpfNum = soDigitos(req(dto.cpf(), "CPF"));
        if (clienteRepo.existsByCpf(cpfNum))
            throw new IllegalArgumentException("CPF já cadastrado.");

        // nome válido
        validarNome(req(dto.primeiroNome(), "Primeiro nome"),
                    req(dto.sobrenome(), "Sobrenome"));

        // valida/completa endereços por CEP
        List<Endereco> enderecos = new ArrayList<>();
        for (var e : reqList(dto.enderecos(), "Endereços")) {
            Endereco end = montarEnderecoComViaCep(e);
            enderecos.add(end);
        }

        // verifica existência de FATURAMENTO e ENTREGAs
        boolean temFat = enderecos.stream().anyMatch(x -> x.getTipo() == TipoEndereco.FATURAMENTO);
        boolean temEnt = enderecos.stream().anyMatch(x -> x.getTipo() == TipoEndereco.ENTREGA);

        if (!temFat)
            throw new IllegalArgumentException("Endereço de faturamento é obrigatório.");

        // copia FATURAMENTO → ENTREGA quando marcado ou quando não veio entrega
        if (dto.copiarEnderecoEntrega() || !temEnt) {
            Endereco origem = enderecos.stream()
                    .filter(x -> x.getTipo() == TipoEndereco.FATURAMENTO)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Endereço de faturamento é obrigatório."));

            Endereco entrega = Endereco.builder()
                    .tipo(TipoEndereco.ENTREGA)
                    .cep(soDigitos(origem.getCep())) // guardamos com 8 dígitos na base
                    .logradouro(origem.getLogradouro())
                    .bairro(origem.getBairro())
                    .cidade(origem.getCidade())
                    .uf(origem.getUf())
                    .numero(origem.getNumero())
                    .complemento(origem.getComplemento())
                    .build();

            enderecos.add(entrega);
            temEnt = true;
        }

        if (!temEnt)
            throw new IllegalArgumentException("Endereço de entrega é obrigatório (pode ser cópia do faturamento).");

        // monta cliente
        var cliente = Cliente.builder()
                .email(emailNorm)
                .senhaHash(encoder.encode(req(dto.senha(), "Senha")))
                .primeiroNome(dto.primeiroNome().trim())
                .sobrenome(dto.sobrenome().trim())
                .cpf(cpfNum)
                .dataNascimento(dto.dataNascimento())
                .genero(dto.genero())
                .build();

        // proteção extra: garante lista inicializada
        if (cliente.getEnderecos() == null) cliente.setEnderecos(new ArrayList<>());

        for (Endereco e : enderecos) {
            e.setCliente(cliente);
            cliente.getEnderecos().add(e);
        }

        cliente = clienteRepo.save(cliente);
        return new ClienteResumoDTO(cliente.getId(), cliente.getNomeCompleto(), cliente.getEmail());
    }

    /* ===================== PERFIL / SENHA ===================== */

    @Transactional
    public void atualizarPerfil(Long id, ClienteUpdateDTO dto, Long userIdSessao) {
        if (!id.equals(userIdSessao))
            throw new SecurityException("Você só pode editar seus próprios dados.");

        var cliente = clienteRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        validarNome(req(dto.primeiroNome(), "Primeiro nome"),
                    req(dto.sobrenome(), "Sobrenome"));

        cliente.setPrimeiroNome(dto.primeiroNome().trim());
        cliente.setSobrenome(dto.sobrenome().trim());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setGenero(dto.genero());
    }

    @Transactional
    public void alterarSenha(Long id, AlterarSenhaDTO dto, Long userIdSessao) {
        if (!id.equals(userIdSessao))
            throw new SecurityException("Você só pode alterar a sua própria senha.");

        var cliente = clienteRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        if (!encoder.matches(req(dto.senhaAtual(), "Senha atual"), cliente.getSenhaHash()))
            throw new IllegalArgumentException("Senha atual inválida.");

        cliente.setSenhaHash(encoder.encode(req(dto.novaSenha(), "Nova senha")));
    }

    /* ===================== USADOS NA principal-cliente ===================== */

    public ClienteBasicoDTO getBasico(Long id, Long userIdSessao){
        if (!id.equals(userIdSessao)) throw new SecurityException("Acesso negado.");
        var c = clienteRepo.findById(id).orElseThrow();
        return new ClienteBasicoDTO(
                c.getPrimeiroNome(),
                c.getSobrenome(),
                c.getDataNascimento(),
                c.getGenero()
        );
    }

    public List<EnderecoResumoDTO> listarEnderecosEntrega(Long clienteId, Long userIdSessao){
    if (!clienteId.equals(userIdSessao)) throw new SecurityException("Acesso negado.");

    return endRepo.findByClienteAndTipo(clienteId, TipoEndereco.ENTREGA)
            .stream()
            .map(e -> new EnderecoResumoDTO(
                    e.getId(),
                    formataCep(soDigitos(e.getCep())),
                    e.getLogradouro(),
                    e.getNumero(),
                    e.getComplemento(),
                    e.getBairro(),
                    e.getCidade(),
                    e.getUf(),
                    e.isPadrao()   // <<<<<<<<<< AQUI
            ))
            .toList();
}


    /* ===================== helpers ===================== */

    private Endereco montarEnderecoComViaCep(EnderecoDTO e) {
        // CEP: 8 dígitos
        String cepNum = soDigitos(req(e.cep(), "CEP"));
        if (cepNum.length() != 8) throw new IllegalArgumentException("CEP inválido (use 8 dígitos).");

        ViaCepResponse v = viaCep.buscar(cepNum);
        if (v == null || Boolean.TRUE.equals(v.erro()))
            throw new IllegalArgumentException("CEP não encontrado na base dos Correios.");

        String logradouro = primeiroNaoVazio(e.logradouro(), v.logradouro(), "Logradouro");
        String bairro     = primeiroNaoVazio(e.bairro(),     v.bairro(),     "Bairro");
        String cidade     = primeiroNaoVazio(e.cidade(),     v.localidade(), "Cidade");
        String uf         = primeiroNaoVazio(e.uf(),         v.uf(),         "UF");
        String numero     = req(e.numero(), "Número");

        return Endereco.builder()
                .tipo(reqTipo(e.tipo()))
                .cep(cepNum) // salva só 8 dígitos na base
                .logradouro(logradouro)
                .bairro(bairro)
                .cidade(cidade)
                .uf(uf)
                .numero(numero)
                .complemento(e.complemento())
                .build();
    }

    private TipoEndereco reqTipo(TipoEndereco t) {
        if (t == null) throw new IllegalArgumentException("Tipo de endereço obrigatório.");
        return t;
    }

    private String req(String v, String campo) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException(campo + " é obrigatório.");
        return v;
    }

    private <T> List<T> reqList(List<T> l, String campo) {
        if (l == null || l.isEmpty()) throw new IllegalArgumentException(campo + " são obrigatórios.");
        return l;
    }

    private String soDigitos(String v) { return v.replaceAll("\\D", ""); }

    private String primeiroNaoVazio(String preferencia, String fallback, String campo) {
        String p = (preferencia == null ? "" : preferencia).trim();
        String f = (fallback == null ? "" : fallback).trim();
        String r = !p.isEmpty() ? p : f;
        if (r.isEmpty()) throw new IllegalArgumentException(campo + " é obrigatório.");
        return r;
    }

    private void validarNome(String primeiro, String sobrenome) {
        if (primeiro.trim().length() < 3 || sobrenome.trim().length() < 3)
            throw new IllegalArgumentException("Nome e sobrenome devem ter ao menos 3 letras.");
    }

    private String formataCep(String cep8) {
        if (cep8 == null || cep8.length() != 8) return cep8;
        return cep8.substring(0,5) + "-" + cep8.substring(5);
    }

    @Transactional
    public void adicionarEnderecoEntrega(Long clienteId, EnderecoDTO dto, Long userIdSessao) {
        if (!clienteId.equals(userIdSessao)) {
            throw new SecurityException("Acesso negado.");
        }

        Cliente cliente = clienteRepo.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        // Reaproveita toda a validação + ViaCEP
        Endereco end = montarEnderecoComViaCep(dto);

        // Garante que é endereço de ENTREGA se o front não mandar explicitamente
        if (end.getTipo() == null) {
            end.setTipo(TipoEndereco.ENTREGA);
        }

        end.setCliente(cliente);
        endRepo.save(end);
    }

    @Transactional
    public void tornarEnderecoPadrao(Long enderecoId, Long userIdSessao) {

        Endereco endereco = endRepo.findById(enderecoId)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado."));

        Cliente cliente = endereco.getCliente();

        if (!cliente.getId().equals(userIdSessao)) {
            throw new SecurityException("Você só pode alterar seus próprios endereços.");
        }

        // Desmarca todos os endereços do cliente
        List<Endereco> todos = endRepo.findByCliente(cliente);
        for (Endereco e : todos) {
            e.setPadrao(false);
        }

        // Marca apenas o selecionado como padrão
        endereco.setPadrao(true);

        // Salva (o commit do @Transactional aplica tudo)
    }

}
