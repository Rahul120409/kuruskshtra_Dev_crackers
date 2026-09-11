package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.CityRequest;
import com.saloon.Salonmgmt.dto.CityResponse;
import com.saloon.Salonmgmt.dto.StateRequest;
import com.saloon.Salonmgmt.dto.StateResponse;
import com.saloon.Salonmgmt.entity.City;
import com.saloon.Salonmgmt.entity.State;
import com.saloon.Salonmgmt.repository.CityRepository;
import com.saloon.Salonmgmt.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @Transactional
    public StateResponse createState(StateRequest request) {
        String name = request.getEffectiveName();
        String code = request.getEffectiveCode();

        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("State name is required");
        }
        if (code == null || code.isEmpty()) {
            throw new IllegalArgumentException("State code is required");
        }

        if (stateRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("State with name '" + name + "' already exists");
        }
        if (stateRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("State with code '" + code + "' already exists");
        }

        State state = State.builder()
                .name(name)
                .code(code)
                .build();

        State saved = stateRepository.save(state);
        return StateResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<StateResponse> getAllStates() {
        return stateRepository.findAllByOrderByNameAsc()
                .stream()
                .map(StateResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StateResponse getStateById(UUID id) {
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("State not found with id: " + id));
        return StateResponse.fromEntity(state);
    }

    @Transactional
    public CityResponse createCity(CityRequest request) {
        String name = request.getEffectiveName();
        String code = request.getEffectiveCode();

        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("City name is required");
        }
        if (code == null || code.isEmpty()) {
            throw new IllegalArgumentException("City code is required");
        }

        State state;
        if (request.getStateId() != null) {
            state = stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected state not found with ID: " + request.getStateId()));
        } else if (request.getStateCode() != null && !request.getStateCode().trim().isEmpty()) {
            state = stateRepository.findByCodeIgnoreCase(request.getStateCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Selected state not found with code: " + request.getStateCode()));
        } else {
            throw new IllegalArgumentException("Please select a state (stateId or stateCode is required)");
        }

        if (cityRepository.existsByStateIdAndNameIgnoreCase(state.getId(), name)) {
            throw new IllegalArgumentException("City '" + name + "' already exists in state " + state.getName());
        }
        if (cityRepository.existsByStateIdAndCodeIgnoreCase(state.getId(), code)) {
            throw new IllegalArgumentException("City code '" + code + "' already exists in state " + state.getName());
        }

        City city = City.builder()
                .name(name)
                .code(code)
                .state(state)
                .build();

        City saved = cityRepository.save(city);
        return CityResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getCitiesByStateId(UUID stateId) {
        return cityRepository.findByStateIdOrderByNameAsc(stateId)
                .stream()
                .map(CityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getCitiesByStateCode(String stateCode) {
        return cityRepository.findByStateCodeOrderByNameAsc(stateCode)
                .stream()
                .map(CityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getAllCities() {
        return cityRepository.findAllWithStateOrderByNameAsc()
                .stream()
                .map(CityResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
