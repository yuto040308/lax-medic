package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Casualty struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OccurredAt     time.Time `gorm:"default:now()" json:"occurred_at"`
	PatientName    string    `gorm:"not null" json:"patient_name"`
	University     string    `json:"university"`
	Grade          string    `json:"grade"`
	Position       string    `json:"position"`
	LocationDetail string    `json:"location_detail"`
	InjuryDetail   string    `json:"injury_detail"`
	Treatment      string    `json:"treatment"`
	Transport      string    `json:"transport_needed"`
	StaffContact   string    `json:"staff_contact"`
	Responder      string    `json:"responder"`
	Remarks        string    `json:"remarks"`
	CreatedAt      time.Time `gorm:"default:now()" json:"created_at"`
}

var db *gorm.DB

func main() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/lax_medic?sslmode=disable"
	}

	db, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// 自動マイグレーション
	err = db.AutoMigrate(&Casualty{})
	if err != nil {
		log.Fatalf("Error during migration: %v", err)
	}

	r := gin.Default()

	// CORS設定
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"https://lax-medic.vercel.app",
	}
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	// 簡易認証エンドポイント
	r.POST("/api/login", func(c *gin.Context) {
		var loginData struct {
			Name     string `json:"name"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&loginData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		sharedPass := os.Getenv("SHARED_PASSWORD")
		if sharedPass == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error: password not set"})
			return
		}

		if loginData.Password == sharedPass {
			c.JSON(http.StatusOK, gin.H{
				"message": "Login successful",
				"user":    loginData.Name,
			})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		}
	})

	// 傷病者一覧取得
	r.GET("/api/casualties", func(c *gin.Context) {
		var casualties []Casualty
		result := db.Order("occurred_at desc").Find(&casualties)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch casualties: " + result.Error.Error()})
			return
		}
		c.JSON(http.StatusOK, casualties)
	})

	// 傷病者登録
	r.POST("/api/casualties", func(c *gin.Context) {
		var cas Casualty
		if err := c.ShouldBindJSON(&cas); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		result := db.Create(&cas)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert record: " + result.Error.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Record created successfully", "id": cas.ID})
	})

	// ポート番号を環境変数から取得
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
