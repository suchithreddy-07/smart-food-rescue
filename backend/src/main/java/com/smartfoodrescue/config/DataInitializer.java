package com.smartfoodrescue.config;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.repository.FoodListingRepository;
import com.smartfoodrescue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedInitialData(UserRepository userRepository,
                                      FoodListingRepository listingRepository,
                                      PasswordEncoder passwordEncoder,
                                      @Value("${ADMIN_EMAIL:admin@smartfoodrescue.local}") String adminEmail,
                                      @Value("${ADMIN_PASSWORD:Admin@12345}") String adminPassword) {
        return args -> {
            // Seed Admin
            if (userRepository.findByEmail(adminEmail.toLowerCase()).isEmpty()) {
                User admin = new User();
                admin.setName("Platform Admin");
                admin.setEmail(adminEmail.toLowerCase());
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                admin.setOrganizationName("Smart Food Rescue Platform");
                admin.setCity("National Network");
                admin.setPhone("+91 98765 43210");
                admin.setAddress("Platform Central Hub");
                userRepository.save(admin);
            }

            // Seed Demo Provider
            User provider = userRepository.findByEmail("provider@smartfoodrescue.local").orElseGet(() -> {
                User u = new User();
                u.setName("Priya Sharma");
                u.setEmail("provider@smartfoodrescue.local");
                u.setPassword(passwordEncoder.encode("Provider@12345"));
                u.setRole(Role.PROVIDER);
                u.setOrganizationName("Green Haven Community Kitchen");
                u.setCity("Hyderabad");
                u.setPhone("+91 98480 12345");
                u.setAddress("Plot 42, Hitech City Main Road, Madhapur");
                return userRepository.save(u);
            });

            // Seed Demo Orphanage
            userRepository.findByEmail("orphanage@smartfoodrescue.local").orElseGet(() -> {
                User u = new User();
                u.setName("David Rao");
                u.setEmail("orphanage@smartfoodrescue.local");
                u.setPassword(passwordEncoder.encode("Orphanage@12345"));
                u.setRole(Role.ORPHANAGE);
                u.setOrganizationName("Hope Children's Shelter & Care");
                u.setCity("Hyderabad");
                u.setPhone("+91 99890 54321");
                u.setAddress("Door 12-4, Jubilee Hills Road No. 10");
                return userRepository.save(u);
            });

            // Seed clearly labeled Sample Listings if none exist
            if (listingRepository.count() == 0) {
                createSampleListing(listingRepository, provider,
                        "[Sample Data] Fresh Veg Biryani & Mixed Vegetable Curry",
                        "Freshly prepared surplus vegetarian biryani with raita and mixed vegetable curry. Prepared today at lunch service, packed in hygienic containers.",
                        "Cooked meals", 35, "portions", LocalDate.now().plusDays(2),
                        "Plot 42, Hitech City Main Road, Madhapur", "Hyderabad");

                createSampleListing(listingRepository, provider,
                        "[Sample Data] Artisan Whole Wheat Bread & Dinner Rolls",
                        "Daily bakery surplus including 16 loaves of whole wheat sandwich bread and 20 dinner rolls. Baked this morning.",
                        "Bakery", 25, "loaves", LocalDate.now().plusDays(3),
                        "Plot 42, Hitech City Main Road, Madhapur", "Hyderabad");

                createSampleListing(listingRepository, provider,
                        "[Sample Data] Fresh Organic Apples & Seasonal Citrus",
                        "Farm-fresh crate of organic Shimla apples and Nagpur oranges in excellent edible condition.",
                        "Produce", 30, "kg", LocalDate.now().plusDays(4),
                        "Plot 42, Hitech City Main Road, Madhapur", "Hyderabad");

                createSampleListing(listingRepository, provider,
                        "[Sample Data] Chilled Pasteurized Milk & Cottage Cheese",
                        "Surplus pasteurized full-cream milk packets (10L) and fresh cottage cheese paneer blocks (5kg). Stored at 4°C.",
                        "Dairy", 15, "liters", LocalDate.now().plusDays(2),
                        "Plot 42, Hitech City Main Road, Madhapur", "Hyderabad");

                createSampleListing(listingRepository, provider,
                        "[Sample Data] Packaged Dal Tadka & Steamed Rice Meal Kits",
                        "Sealed, microwave-safe retort pouches of yellow dal tadka and cumin steamed rice. Ready to heat and serve.",
                        "Vegetarian", 40, "portions", LocalDate.now().plusDays(5),
                        "Plot 42, Hitech City Main Road, Madhapur", "Hyderabad");
            }
        };
    }

    private void createSampleListing(FoodListingRepository repo, User provider,
                                     String title, String desc, String type,
                                     int qty, String unit, LocalDate expiry,
                                     String address, String city) {
        FoodListing item = new FoodListing();
        item.setProvider(provider);
        item.setTitle(title);
        item.setDescription(desc);
        item.setFoodType(type);
        item.setQuantity(qty);
        item.setRemainingQuantity(qty);
        item.setUnit(unit);
        item.setExpiryDate(expiry);
        item.setPickupAddress(address);
        item.setCity(city);
        item.setStatus(ListingStatus.AVAILABLE);
        repo.save(item);
    }
}
