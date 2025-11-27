import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHashForCSS {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String username = "CSS";
        String password = "ny2J8K@twX07**";
        String hash = encoder.encode(password);

        System.out.println("================================================================================");
        System.out.println("NOUVEAU HASH BCRYPT POUR L'UTILISATEUR CSS");
        System.out.println("================================================================================");
        System.out.println();
        System.out.println("Utilisateur    : " + username);
        System.out.println("Mot de passe   : " + password);
        System.out.println();
        System.out.println("Nouveau hash BCrypt genere :");
        System.out.println(hash);
        System.out.println();
        System.out.println("================================================================================");
        System.out.println("REQUETE SQL POUR METTRE A JOUR POSTGRESQL");
        System.out.println("================================================================================");
        System.out.println();
        System.out.println("UPDATE sss_config_general_db.ac_users");
        System.out.println("SET passe_word = '" + hash + "'");
        System.out.println("WHERE user_name = '" + username + "';");
        System.out.println();
        System.out.println("================================================================================");
        System.out.println();

        // Test de verification
        boolean test = encoder.matches(password, hash);
        System.out.println("Test de verification : " + (test ? "OK - Le hash correspond au mot de passe" : "ERREUR"));
        System.out.println("================================================================================");
    }
}
