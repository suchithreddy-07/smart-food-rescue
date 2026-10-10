package com.smartfoodrescue.config;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.repository.FoodListingRepository;
import com.smartfoodrescue.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Pattern;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final Pattern BCRYPT_PATTERN =
            Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    @Bean
    CommandLineRunner seedInitialData(UserRepository userRepository,
                                      FoodListingRepository listingRepository,
                                      PasswordEncoder passwordEncoder,
                                      @Value("${ADMIN_EMAIL:admin@smartfoodrescue.local}") String adminEmail,
                                      @Value("${ADMIN_PASSWORD:Admin@12345}") String adminPassword) {
        return args -> {
            // Seed Admin
            Optional<User> existingAdmin = userRepository.findByEmail(adminEmail.toLowerCase());
            if (existingAdmin.isPresent()) {
                repairPasswordIfInvalid(existingAdmin.get(), adminPassword, userRepository, passwordEncoder);
            } else {
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
            Optional<User> existingProvider = userRepository.findByEmail("provider@smartfoodrescue.local");
            existingProvider.ifPresent(u ->
                    repairPasswordIfInvalid(u, "Provider@12345", userRepository, passwordEncoder));
            User provider = existingProvider.orElseGet(() -> {
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
            Optional<User> existingOrphanage = userRepository.findByEmail("orphanage@smartfoodrescue.local");
            existingOrphanage.ifPresent(u ->
                    repairPasswordIfInvalid(u, "Orphanage@12345", userRepository, passwordEncoder));
            existingOrphanage.orElseGet(() -> {
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

    private void repairPasswordIfInvalid(User user, String demoPassword,
                                         UserRepository userRepository,
                                         PasswordEncoder passwordEncoder) {
        String current = user.getPassword();
        if (current != null && BCRYPT_PATTERN.matcher(current).matches()) {
            return;
        }
        user.setPassword(passwordEncoder.encode(demoPassword));
        userRepository.save(user);
        log.warn("Re-encoded invalid password hash for demo account {}", user.getEmail());
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
