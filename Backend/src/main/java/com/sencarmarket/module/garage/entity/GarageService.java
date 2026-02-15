package com.sencarmarket.module.garage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "garage_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GarageService {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "garage_id")
    private UUID garageId;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(name = "prix", precision = 12, scale = 2)
    private BigDecimal prix;
}
