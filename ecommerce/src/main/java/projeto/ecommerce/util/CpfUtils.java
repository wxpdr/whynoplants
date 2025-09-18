package projeto.ecommerce.util;

public class CpfUtils {
    public static String somenteDigitos(String s){
        return s == null ? null : s.replaceAll("\\D", "");
    }
    public static boolean formatoValido(String cpf){
        return cpf != null && cpf.matches("\\d{11}") && !cpf.chars().allMatch(ch -> ch == cpf.charAt(0));
    }
    public static boolean digitosValidos(String cpf){
        if (!formatoValido(cpf)) return false;
        int d1=0,d2=0;
        for(int i=0,p=10;i<9;i++,p--) d1 += (cpf.charAt(i)-'0')*p;
        d1 = (d1*10)%11; if(d1==10) d1=0;
        for(int i=0,p=11;i<10;i++,p--) d2 += (cpf.charAt(i)-'0')*p;
        d2 = (d2*10)%11; if(d2==10) d2=0;
        return d1==(cpf.charAt(9)-'0') && d2==(cpf.charAt(10)-'0');
    }
}
