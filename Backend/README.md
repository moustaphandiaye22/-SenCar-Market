# Sen-Car-Market Backend

## Description
Backend pour la plateforme Sen-Car Market - Une application de vente de véhicules au Sénégal.

## Technologies
- Spring Boot 3.2.0
- Java 17
- Maven
- MySQL
- Spring Security
- Spring Data JPA

## Configuration

### Base de données
Assurez-vous d'avoir MySQL installé et en cours d'exécution. Créez une base de données:
```sql
CREATE DATABASE sen_car_market;
```

### Configuration
Modifiez le fichier `src/main/resources/application.properties` pour configurez votre connexion MySQL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sen_car_market
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

## Installation et Exécution

### Compiler le projet
```bash
mvn clean install
```

### Lancer l'application
```bash
mvn spring-boot:run
```

L'application sera accessible à l'adresse: http://localhost:8080

## Endpoints
- `GET /api/hello` - Message de bienvenu
- `GET /api/health` - Vérification de l'état de l'application

## Structure du projet
```
Backend/
├── src/
│   ├── main/
│   │   ├── java/com/sencarmarket/
│   │   │   ├── config/         # Configuration Spring
│   │   │   ├── controller/      # Controllers REST
│   │   │   ├── model/          # Entités JPA
│   │   │   ├── repository/     # Interfaces Repository
│   │   │   └── service/        # Services métier
│   │   └── resources/
│   │       ├── application.properties
│   │       └── ...
│   └── test/                   # Tests unitaires et d'intégration
└── pom.xml
```

## Dépendances principales
- Spring Boot Web
- Spring Data JPA
- Spring Security
- MySQL Connector
- Lombok
Taphaisco22