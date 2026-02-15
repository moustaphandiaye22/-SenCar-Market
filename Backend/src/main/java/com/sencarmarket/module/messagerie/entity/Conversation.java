package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "titre")
    private String titre;

    @Column(name = "date_derniere_message")
    private LocalDateTime dateDerniereMessage;
}
