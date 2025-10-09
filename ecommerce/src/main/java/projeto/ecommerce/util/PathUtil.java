package projeto.ecommerce.util;

public final class PathUtil {
    private PathUtil(){}

    /** Normaliza valores salvos no banco para uma URL web: /uploads/... */
    public static String normalizeUploadPath(String arquivo){
        if (arquivo == null || arquivo.isBlank()) return null;
        // se já for http(s), retorna como está
        if (arquivo.startsWith("http://") || arquivo.startsWith("https://")) return arquivo;
        String p = arquivo.trim()
                .replace("\\", "/")      // troca barras invertidas
                .replaceAll("^/+", "");  // remove / do começo (se tiver)
        return "/" + p;                  // garante /uploads/...
    }
}
