package com.saloon.Salonmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SalonmgmtApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalonmgmtApplication.class, args);
	}
	

}

