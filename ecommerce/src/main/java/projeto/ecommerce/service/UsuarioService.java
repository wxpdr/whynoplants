package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projeto.ecommerce.dto.UsuarioCreateDTO;
import projeto.ecommerce.dto.UsuarioUpdateDTO;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;
import projeto.ecommerce.util.CpfUtils;
import projeto.ecommerce.dto.ChangePasswordDTO;


import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository repo;
    private final SecurityService security;

    @Transactional
    public Usuario criar(UsuarioCreateDTO dto) {
        String email = dto.email().toLowerCase();

        if (repo.existsByEmail(email)) throw new IllegalArgumentException("Já existe um usuário com este e-mail.");

        String cpf = CpfUtils.somenteDigitos(dto.cpf());
        if (!CpfUtils.digitosValidos(cpf)) throw new IllegalArgumentException("CPF inválido.");
        if (repo.existsByCpf(cpf)) throw new IllegalArgumentException("Já existe um usuário com este CPF.");

        Usuario u = new Usuario();
        u.setNome(dto.nome());
        u.setCpf(cpf);
        u.setEmail(email);
        // BCrypt (mantido): usa o teu SecurityService
        u.setSenha(security.encryptPassword(dto.senha()));
        u.setPerfil(dto.perfil());
        u.setAtivo(true);

        return repo.save(u);
    }


    @Transactional(readOnly = true)
    public List<Usuario> listar(String filtroNome) {
        if (filtroNome == null || filtroNome.trim().isEmpty()) {
            return repo.findAll();
        }
        return repo.findByNomeContainingIgnoreCaseOrderByNomeAsc(filtroNome.trim());
    }

    @Transactional(readOnly = true)
    public Usuario buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }

    @Transactional
    public Usuario atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario u = buscar(id);
        u.setNome(dto.getNome());

        String cpf = CpfUtils.somenteDigitos(dto.getCpf());
        if (!CpfUtils.digitosValidos(cpf)) throw new IllegalArgumentException("CPF inválido.");
        u.setCpf(cpf);

        u.setPerfil(dto.getPerfil());

        // troca de senha no update principal é opcional; se vier novaSenha, aplica BCrypt
        if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
            u.setSenha(security.encryptPassword(dto.getNovaSenha())); // BCrypt
        }
        return repo.save(u);
    }

    @Transactional
    public void alterarSenha(Long id, ChangePasswordDTO dto){
        Usuario u = buscar(id);
        if (!security.checkPassword(dto.senhaAtual(), u.getSenha()))
            throw new IllegalArgumentException("Senha atual incorreta");
        u.setSenha(security.encryptPassword(dto.novaSenha())); // BCrypt
        repo.save(u);
    }


    @Transactional
    public Usuario alternarStatus(Long id) {
        Usuario u = buscar(id);
        u.setAtivo(!u.isAtivo());
        return repo.save(u);
    }

    @Transactional
    public void deletar(Long id) {
        Usuario u = buscar(id);
        repo.delete(u);
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorEmail(String email) {
        if (email == null) return null;
        return repo.findByEmail(email.toLowerCase()).orElse(null);
    }
}
