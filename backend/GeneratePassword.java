import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "test123";
        String hash = encoder.encode(password);
        System.out.println("=================================================");
        System.out.println("Mot de passe: " + password);
        System.out.println("Hash BCrypt: " + hash);
        System.out.println("=================================================");
        System.out.println("SQL pour PostgreSQL:");
        System.out.println("UPDATE sss_config_general_db.ac_users SET passe_word = '" + hash + "' WHERE user_name = 'testadmin';");
        System.out.println("=================================================");
    }
}
