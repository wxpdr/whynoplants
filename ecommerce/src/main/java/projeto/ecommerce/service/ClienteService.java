package projeto.ecommerce.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import projeto.ecommerce.dto.*;
import projeto.ecommerce.model.Cliente;
import projeto.ecommerce.model.Endereco;
import projeto.ecommerce.model.TipoEndereco;
import projeto.ecommerce.repository.ClienteRepository;
import projeto.ecommerce.util.viacep.ViaCepResponse;
import projeto.ecommerce.util.viacep.ViaCepService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepo;
    private final PasswordEncoder encoder;
    private final ViaCepService viaCep;

    @Transactional
    public ClienteResumoDTO criar(ClienteCreateDTO dto) {
        if (clienteRepo.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email já cadastrado.");
        if (clienteRepo.existsByCpf(dto.cpf()))
            throw new IllegalArgumentException("CPF já cadastrado.");

        // Valida/completa por CEP
        List<Endereco> enderecos = dto.enderecos().stream().map(e -> {
            ViaCepResponse v = viaCep.buscar(e.cep());
            return Endereco.builder()
                    .tipo(e.tipo())
                    .cep(e.cep())
                    .logradouro(e.logradouro().isBlank() ? v.logradouro() : e.logradouro())
                    .bairro(e.bairro().isBlank() ? v.bairro() : e.bairro())
                    .cidade(e.cidade().isBlank() ? v.localidade() : e.cidade())
                    .uf(e.uf().isBlank() ? v.uf() : e.uf())
                    .numero(e.numero())
                    .complemento(e.complemento())
                    .build();
        }).toList();

        // Copiar faturamento → entrega se solicitado
        if (dto.copiarEnderecoEntrega() &&
             enderecos.stream().noneMatch(e -> e.getTipo() == TipoEndereco.ENTREGA)) {
            Endereco origem = enderecos.stream()
                    .filter(e -> e.getTipo() == TipoEndereco.FATURAMENTO)
                    .findFirst().orElseThrow(() ->
                            new IllegalArgumentException("Endereço de faturamento é obrigatório."));
            Endereco entrega = Endereco.builder()
                    .tipo(TipoEndereco.ENTREGA)
                    .cep(origem.getCep())
                    .logradouro(origem.getLogradouro())
                    .bairro(origem.getBairro())
                    .cidade(origem.getCidade())
                    .uf(origem.getUf())
                    .numero(origem.getNumero())
                    .complemento(origem.getComplemento())
                    .build();
            var tmp = new java.util.ArrayList<>(enderecos);
            tmp.add(entrega);
            enderecos = tmp;
        }

        boolean temFat = enderecos.stream().anyMatch(e -> e.getTipo() == TipoEndereco.FATURAMENTO);
        boolean temEnt = enderecos.stream().anyMatch(e -> e.getTipo() == TipoEndereco.ENTREGA);
        if (!temFat || !temEnt) {
            throw new IllegalArgumentException("Informe faturamento e entrega (entrega pode ser cópia).");
        }

        var cliente = Cliente.builder()
                .email(dto.email().toLowerCase())
                .senhaHash(encoder.encode(dto.senha()))
                .primeiroNome(dto.primeiroNome().trim())
                .sobrenome(dto.sobrenome().trim())
                .cpf(dto.cpf())
                .dataNascimento(dto.dataNascimento())
                .genero(dto.genero())
                .build();

        for (Endereco e : enderecos) {
            e.setCliente(cliente);
            cliente.getEnderecos().add(e);
        }

        cliente = clienteRepo.save(cliente);
        return new ClienteResumoDTO(cliente.getId(), cliente.getNomeCompleto(), cliente.getEmail());
    }

    @Transactional
    public void atualizarPerfil(Long id, ClienteUpdateDTO dto, Long userIdSessao) {
        if (!id.equals(userIdSessao))
            throw new SecurityException("Você só pode editar seus próprios dados.");
        var cliente = clienteRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));
        cliente.setPrimeiroNome(dto.primeiroNome());
        cliente.setSobrenome(dto.sobrenome());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setGenero(dto.genero());
    }

    @Transactional
    public void alterarSenha(Long id, AlterarSenhaDTO dto, Long userIdSessao) {
        if (!id.equals(userIdSessao))
            throw new SecurityException("Você só pode alterar a sua própria senha.");
        var cliente = clienteRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));
        if (!encoder.matches(dto.senhaAtual(), cliente.getSenhaHash()))
            throw new IllegalArgumentException("Senha atual inválida.");
        cliente.setSenhaHash(encoder.encode(dto.novaSenha()));
    }
}