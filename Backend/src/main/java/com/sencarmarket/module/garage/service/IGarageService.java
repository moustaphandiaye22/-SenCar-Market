package com.sencarmarket.module.garage.service;

import com.sencarmarket.module.garage.entity.Garage;
import com.sencarmarket.module.garage.entity.GarageService;
import com.sencarmarket.module.garage.entity.ServiceGarage;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service garage
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IGarageService {

    // Garage
    Garage createGarage(Garage garage);

    Garage updateGarage(UUID id, Garage garage);

    void deleteGarage(UUID id);

    Garage getGarageById(UUID id);

    List<Garage> getAllGarages();

    List<Garage> getGaragesByProprietaire(UUID proprietaireId);

    List<Garage> searchGaragesByLocalisation(String localisation);

    // Service Garage
    ServiceGarage createService(ServiceGarage service);

    ServiceGarage updateService(UUID id, ServiceGarage service);

    void deleteService(UUID id);

    ServiceGarage getServiceById(UUID id);

    List<ServiceGarage> getAllServices();

    List<ServiceGarage> getServicesByGarage(UUID garageId);

    // Garage Service (réservation)
    GarageService createReservation(GarageService reservation);

    GarageService updateReservation(UUID id, GarageService reservation);

    GarageService getReservationById(UUID id);

    List<GarageService> getReservationsByGarage(UUID garageId);

    List<GarageService> getReservationsByClient(UUID clientId);
}
