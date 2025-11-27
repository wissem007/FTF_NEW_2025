package com.football.management.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // ✅ AJOUTÉ : Configuration du serveur
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8082");
        localServer.setDescription("Serveur de développement local");
        
        Server prodServer = new Server();
        prodServer.setUrl("https://licencesftf.com");
        prodServer.setDescription("Serveur de production");

        return new OpenAPI()
                .servers(List.of(localServer, prodServer))  // ✅ AJOUTÉ
                .info(new Info()
                        .title("API Gestion des Licences - FTF")
                        .description("API REST pour la gestion des demandes de licences de football")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Équipe Technique FTF")
                                .email("support@ftf.tn")
                                .url("https://licencesftf.com"))
                        .license(new License()
                                .name("Propriétaire")
                                .url("https://licencesftf.com/licence")));
    }
}