package com.smartfoodrescue.dto;

import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.entity.User;
import java.time.Instant;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String organizationName;
    private String phone;
    private String address;
    private String city;
    private boolean enabled;
    private Instant createdAt;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.id = user.getId();
        r.name = user.getName();
        r.email = user.getEmail();
        r.role = user.getRole();
        r.organizationName = user.getOrganizationName();
        r.phone = user.getPhone();
        r.address = user.getAddress();
        r.city = user.getCity();
        r.enabled = user.isEnabled();
        r.createdAt = user.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getOrganizationName() { return organizationName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
}
