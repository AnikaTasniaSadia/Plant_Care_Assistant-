# PLANT CARE ASSISTANT

## Project Report

### 1. Introduction
Plant Care Assistant is a frontend-first web application designed to help users select and maintain plants according to their geographical location and real-time weather conditions. The system automatically detects the user's location, fetches live weather data, and recommends suitable plants along with proper care instructions. The project is built using core web technologies such as HTML, CSS, and Vanilla JavaScript without any build tools or frameworks. It integrates external APIs for weather and location services and uses Supabase for authentication and data management. An optional local AI chatbot powered by Ollama enhances the user experience by answering plant-related questions.

### 2. Objectives
- Detect the user's location automatically
- Display real-time weather information
- Recommend plants based on country and climate
- Provide plant care instructions
- Implement an admin dashboard for plant data management
- Support offline fallback functionality
- Optionally integrate a local AI chatbot for assistance

### 3. Key Features
- Automatic location detection with IP and browser geolocation fallback
- Live weather display with OpenWeather and Open-Meteo fallback
- Country-based plant recommendations and care guides
- Plant issues and solutions for common diseases
- Admin dashboard for CRUD operations on plant data
- Offline demo mode using localStorage
- Optional local AI chatbot for plant care assistance
- Responsive UI across devices

### 4. Technologies Used
**Frontend Technologies**
- HTML5
- CSS3
- Vanilla JavaScript

**APIs and External Services**
- Browser Geolocation API
- OpenWeather API
- Open-Meteo API
- IP-based location services (ipapi, ipwho, ipinfo)

**Backend-as-a-Service**
- Supabase Authentication
- Supabase Database

**Storage**
- localStorage
- sessionStorage

**Optional AI Integration**
- Node.js backend
- Ollama (TinyLlama model)

**Development Tools**
- Visual Studio Code
- Git and GitHub

### 5. System Overview
The Plant Care Assistant follows a frontend-first architecture where all primary functionalities are handled using static HTML, CSS, and JavaScript files. The application interacts with:
- Weather APIs for climate data
- Geolocation APIs for location detection
- Supabase for authentication and admin data
- Optional local AI backend for chatbot functionality

The system is designed to work even without backend dependency using offline fallback mechanisms.

### 6. System Architecture
**Components**
1. User Browser - Interface where users access the application
2. Frontend Layer - HTML, CSS, and JavaScript pages
3. External APIs - Weather and location services
4. Supabase - Authentication and database management
5. Optional AI Backend - Local chatbot using Ollama

**Architecture Diagram (Mermaid)**
```mermaid
flowchart LR

Browser --> Frontend
Frontend <--> Backend
Browser <--> GeoAPI
GeoAPI --> Country
Frontend <--> Country
Country --> PlantService
PlantService --> PlantDisease
Backend <--> Supabase
Supabase <--> PlantDisease

subgraph External1
Frontend["Frontend
HTML CSS JavaScript
Home Plants
Weather Admin"]
end

subgraph External2
Backend["Backend BaaS
Supabase Auth
Supabase Database"]
end

subgraph External3
GeoAPI["Geolocation APIs
Browser Geolocation
IP Location"]
end

subgraph GeoModule
Country["Country
HTML Geolocation
Climate"]
end

subgraph DataLayer
PlantService["Plant Service
plant_id_PK
name
water_freq
0_to_N"]

PlantDisease["Plant Disease
plant_id_PK
url_0_to_N
caption_0_to_N"]
end

subgraph SupaLayer
Supabase["Supabase
Auth
Database"]
end


```

### 7. ER Diagram (Entity Relationship Diagram)
**Entities**
1. User
   - user_id (Primary Key)
   - email
   - role
2. Country
   - country_id (Primary Key)
   - name
   - climate
3. Plant
   - plant_id (Primary Key)
   - name
   - type
   - light
   - water_frequency
   - care
4. PlantImage
   - image_id (Primary Key)
   - plant_id (Foreign Key)
   - url
   - caption
5. PlantDisease
   - disease_id (Primary Key)
   - plant_id (Foreign Key)
   - name
   - solution

**Relationships**
- A Country has many Plants
- A Plant has many Images
- A Plant has many Diseases

**ER Diagram (Mermaid)**
```mermaid
erDiagram
  USER {
    int user_id PK
    string email
    string role
  }
  COUNTRY {
    int country_id PK
    string name
    string climate
  }
  PLANT {
    int plant_id PK
    string name
    string type
    string light
    string water_frequency
    string care
  }
  PLANT_IMAGE {
    int image_id PK
    int plant_id FK
    string url
    string caption
  }
  PLANT_DISEASE {
    int disease_id PK
    int plant_id FK
    string name
    string solution
  }

   USER  ||--o{ COUNTRY : user loin and search country based plants
  COUNTRY ||--o{ PLANT : has
  PLANT ||--o{ PLANT_IMAGE : has
  PLANT ||--o{ PLANT_DISEASE : has
```

### 8. Class Diagram
**Service Classes**
1. LocationService
   - detectUserLocation()
2. WeatherService
   - getWeather()
   - generateCareTips()
3. PlantService
   - loadPlants()
   - getPlantDetails()
4. AuthService
   - login()
   - register()
5. AdminService
   - addPlant()
   - updatePlant()
   - deletePlant()

**Class Diagram (Mermaid)**
```mermaid
classDiagram
title Plant Care Assistant - Class Diagram

class User {
  -String userId
  -String email
  -String role
  +Boolean login(String email, String password)
  +void logout()
}

class Admin {
  -String accessLevel
  +Boolean addPlant(Plant plant)
  +Boolean updatePlant(String plantId)
  +Boolean deletePlant(String plantId)
}

class AuthService {
  -String sessionToken
  +Boolean authenticate(String email, String password)
  +Boolean validateSession(String token)
  +void logoutUser(String userId)
}

class AdminService {
  +Boolean manageCountry()
  +Boolean manageDisease()
}

class Country {
  -String countryId
  -String name
  -String climate
  +List~Plant~ getPlants()
}

class Plant {
  -String plantId
  -String name
  -String type
  -String light
  -String waterFrequency
  -String care
  +List~PlantDisease~ getDiseases()
  +List~PlantImage~ getImages()
}

class PlantDisease {
  -String diseaseId
  -String name
  -String solution
  +String getSolution()
}

class PlantImage {
  -String imageId
  -String url
  -String caption
  +void displayImage()
}

class PlantService {
  +List~Plant~ loadPlants(String countryId)
  +Plant getPlantDetails(String plantId)
  +List~PlantDisease~ getPlantDiseases(String plantId)
}

class ChatService {
  +String sendMessage(String message)
  +String getResponse()
}

class LocationService {
  +String detectUserLocation()
  +String reverseGeocode(double lat, double lng)
}

class WeatherService {
  +Weather getWeather(String location)
  +String generateCareTips(Weather weather)
}

class Database {
  -String databaseName
  -Boolean connectionStatus
  +Boolean saveData(Object data)
  +Object fetchData(String query)
  +Boolean updateData(Object data)
  +Boolean deleteData(String id)
}

%% Inheritance
User <|-- Admin

%% Associations
Country "1" --> "0..*" Plant
Plant "1" --> "0..*" PlantDisease
Plant "1" --> "0..*" PlantImage

%% Dependencies
AdminService ..> Country
AdminService ..> PlantDisease
PlantService ..> Plant
PlantService ..> PlantDisease
PlantService ..> Database
AuthService ..> Database
ChatService ..> Database
WeatherService ..> LocationService
WeatherService ..> Database
LocationService ..> Database

```

### 9. Workflow Diagram
**Workflow Steps**
1. User opens website
2. Location is detected
3. Weather data is fetched
4. Plant recommendations are displayed
5. User views plant care guide
6. Optional: User logs in
7. Optional: Admin manages plant data

**Workflow Diagram (Mermaid)**
```mermaid
flowchart TD
  A[Open Website] --> B[Detect Location]
  B --> C[Fetch Weather Data]
  C --> D[Show Plant Recommendations]
  D --> E[View Plant Care Guide]
  E --> F{Login?}
  F -->|No| G[Continue Browsing]
  F -->|Yes| H[Admin Dashboard]
  H --> I[Manage Plant Data]
```

### 10. Module Description
**10.1 Location Detection Module**
Detects user location using browser geolocation. If unavailable, it falls back to IP-based services. The detected location is stored in sessionStorage.

**10.2 Weather Module**
Fetches weather data from OpenWeather API. If API key is unavailable, Open-Meteo is used as fallback. Based on weather conditions, plant care suggestions are generated.

**10.3 Plant Recommendation Module**
Displays country-specific plant data including climate, common plants, common problems, and care guidelines using PLANTS_DATABASE.

**10.4 Authentication Module**
Uses Supabase authentication for login and registration. Also supports offline admin login using localStorage.

**10.5 Admin Dashboard Module**
Allows administrators to manage:
- Countries
- Plants
- Plant images
- Plant diseases

Supports both online (Supabase) and offline modes.

**10.6 AI Chatbot Module (Optional)**
A local Node.js server communicates with Ollama to provide plant care assistance based on the plant dataset.

### 11. How the System Works
1. When the user opens the Home page, the system detects the location.
2. The Weather page fetches live weather data.
3. The Plants page shows country-specific plant recommendations.
4. The Admin page allows plant data management.
5. The Chatbot assists users with plant-related queries.

### 12. Advantages of the System
- Lightweight frontend architecture
- No build tools required
- Real-time weather integration
- Country-based plant guidance
- Admin management panel
- Optional AI support
- Responsive and modern UI

### 13. Limitations
- Dependent on external APIs
- AI chatbot requires local setup
- Some plant data may need further validation

### 14. Future Scope
- Mobile application version
- More country plant datasets
- Cloud-based AI assistant
- Multilingual support
- Push notifications for plant care reminders
- Integration with IoT plant sensors

### 15. Conclusion
Plant Care Assistant demonstrates how a practical and user-friendly web application can be developed using core frontend technologies. It integrates real-world APIs, authentication systems, and optional AI support while maintaining simplicity and efficiency. The project showcases strong fundamentals in web development, system design, and integration techniques.





