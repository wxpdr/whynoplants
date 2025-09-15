package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projeto.ecommerce.dto.UsuarioCreateDTO;
import projeto.ecommerce.dto.UsuarioUpdateDTO;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository repo;
    private final SecurityService security;

    @Transactional
    public Usuario criar(UsuarioCreateDTO dto) {
        String email = dto.email().toLowerCase();

        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Já existe um usuário com este e-mail.");
        }
        if (repo.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("Já existe um usuário com este CPF.");
        }

        Usuario u = new Usuario();
        u.setNome(dto.nome());
        u.setCpf(dto.cpf());
        u.setEmail(email);
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
        u.setCpf(dto.getCpf());
        u.setPerfil(dto.getPerfil());
        if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
            u.setSenha(security.encryptPassword(dto.getNovaSenha()));
        }
        return repo.save(u);
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
