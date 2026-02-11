PLANT CARE ASSISTANT
Project Report
1. Introduction
Plant Care Assistant is a frontend-first web application designed to help users select and maintain plants according to their geographical location and real-time weather conditions.
The system automatically detects the user’s location, fetches live weather data, and recommends suitable plants along with proper care instructions.
The project is built using core web technologies such as HTML, CSS, and Vanilla JavaScript without any build tools or frameworks. It integrates external APIs for weather and location services and uses Supabase for authentication and data management.
An optional local AI chatbot powered by Ollama enhances the user experience by answering plant-related questions.
2. Objectives
The main objectives of the project are:
•	To detect the user’s location automatically
•	To display real-time weather information
•	To recommend plants based on country and climate
•	To provide plant care instructions
•	To implement an admin dashboard for plant data management
•	To support offline fallback functionality
•	To optionally integrate a local AI chatbot for assistance



3. Technologies Used
Frontend Technologies
•	HTML5
•	CSS3
•	Vanilla JavaScript
APIs and External Services
•	Browser Geolocation API
•	OpenWeather API
•	Open-Meteo API
•	IP-based location services (ipapi, ipwho, ipinfo)
Backend-as-a-Service
•	Supabase Authentication
•	Supabase Database
Storage
•	localStorage
•	sessionStorage
Optional AI Integration
•	Node.js backend
•	Ollama (TinyLlama model)
Development Tools
•	Visual Studio Code
•	Git & GitHub
4. System Overview
The Plant Care Assistant follows a frontend-first architecture where all primary functionalities are handled using static HTML, CSS, and JavaScript files.
The application interacts with:
•	Weather APIs for climate data
•	Geolocation APIs for location detection
•	Supabase for authentication and admin data
•	Optional local AI backend for chatbot functionality
The system is designed to work even without backend dependency using offline fallback mechanisms.
5. System Architecture
The system consists of the following components:
1.	User Browser – Interface where users access the application
2.	Frontend Layer – HTML, CSS, and JavaScript pages
3.	External APIs – Weather and location services
4.	Supabase – Authentication and database management
5.	Optional AI Backend – Local chatbot using Ollama
The frontend communicates with external APIs and Supabase to fetch and manage data.
 
 
6. ER Diagram (Entity Relationship Diagram)
Entities included:
1. User
•	user_id (Primary Key)
•	email
•	role
2. Country
•	country_id (Primary Key)
•	name
•	climate
3. Plant
•	plant_id (Primary Key)
•	name
•	type
•	light
•	water_frequency
•	care
4. PlantImage
•	image_id (Primary Key)
•	plant_id (Foreign Key)
•	url
•	caption
5. PlantDisease
•	disease_id (Primary Key)
•	plant_id (Foreign Key)
•	name
•	solution
Relationships:
•	A Country has many Plants
•	A Plant has many Images
•	A Plant has many Diseases
 
7. Class Diagram
The system includes logical service classes:
1. LocationService
•	detectUserLocation()
2. WeatherService
•	getWeather()
•	generateCareTips()
3. PlantService
•	loadPlants()
•	getPlantDetails()
4. AuthService
•	login()
•	register()
5. AdminService
•	addPlant()
•	updatePlant()
•	deletePlant()
These services interact with the frontend and external systems. 
 
8. Workflow Diagram
Workflow Steps:
1.	User opens website
2.	Location is detected
3.	Weather data is fetched
4.	Plant recommendations are displayed
5.	User views plant care guide
6.	(Optional) User logs in
7.	(Optional) Admin manages plant data
 
9. Module Description
9.1 Location Detection Module
This module detects user location using browser geolocation. If unavailable, it falls back to IP-based services. The detected location is stored in sessionStorage.
9.2 Weather Module
Fetches weather data from OpenWeather API. If API key is unavailable, Open-Meteo is used as fallback. Based on weather conditions, plant care suggestions are generated.
9.3 Plant Recommendation Module
Displays country-specific plant data including climate, common plants, common problems, and care guidelines using PLANTS_DATABASE.
9.4 Authentication Module
Uses Supabase authentication for login and registration. Also supports offline admin login using localStorage.
9.5 Admin Dashboard Module
Allows administrators to manage:
•	Countries
•	Plants
•	Plant images
•	Plant diseases
Supports both online (Supabase) and offline modes.
9.6 AI Chatbot Module (Optional)
A local Node.js server communicates with Ollama to provide plant care assistance based on the plant dataset.
10. How the System Works
1.	When the user opens the Home page, the system detects the location.
2.	The Weather page fetches live weather data.
3.	The Plants page shows country-specific plant recommendations.
4.	The Admin page allows plant data management.
5.	The Chatbot assists users with plant-related queries.
11. Advantages of the System
•	Lightweight frontend architecture
•	No build tools required
•	Real-time weather integration
•	Country-based plant guidance
•	Admin management panel
•	Optional AI support
•	Responsive and modern UI
12. Limitations
•	Dependent on external APIs
•	AI chatbot requires local setup
•	Some plant data may need further validation
13. Future Scope
•	Mobile application version
•	More country plant datasets
•	Cloud-based AI assistant
•	Multilingual support
•	Push notifications for plant care reminders
•	Integration with IoT plant sensors
14. Conclusion
Plant Care Assistant demonstrates how a practical and user-friendly web application can be developed using core frontend technologies.It integrates real-world APIs, authentication systems, and optional AI support while maintaining simplicity and efficiency.The project showcases strong fundamentals in web development, system design, and integration techniques.
