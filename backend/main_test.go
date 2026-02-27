package main

import (
	"os"
	"testing"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestGORMConnection(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/lax_medic?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&Casualty{})
	if err != nil {
		t.Fatalf("Failed to migrate: %v", err)
	}

	// Test Create
	newCasualty := Casualty{
		PatientName: "Test Patient",
		University:  "Test University",
	}
	result := db.Create(&newCasualty)
	if result.Error != nil {
		t.Errorf("Failed to create casualty: %v", result.Error)
	}

	if newCasualty.ID == uuid.Nil {
		t.Errorf("Expected ID to be set, but got empty UUID")
	}

	// Test Read
	var found Casualty
	result = db.First(&found, "id = ?", newCasualty.ID)
	if result.Error != nil {
		t.Errorf("Failed to find casualty: %v", result.Error)
	}
	if found.PatientName != "Test Patient" {
		t.Errorf("Expected PatientName 'Test Patient', but got %s", found.PatientName)
	}

	// Test Clean up (Optional, but good for tests)
	db.Delete(&newCasualty)
}
