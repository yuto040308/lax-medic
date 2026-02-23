package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Casualty struct {
	ID             string `json:"id"`
	OccurredAt     string `json:"occurred_at"`
	PatientName    string `json:"patient_name"`
	University     string `json:"university"`
	Grade          string `json:"grade"`
	Position       string `json:"position"`
	LocationDetail string `json:"location_detail"`
	InjuryDetail   string `json:"injury_detail"`
	Treatment      string `json:"treatment"`
	Transport      string `json:"transport_needed"`
	StaffContact   string `json:"staff_contact"`
	Responder      string `json:"responder"`
	Remarks        string `json:"remarks"`
}

var db *sql.DB

func main() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// ローカル開発用デフォルト（コンテナ外からの接続用、一応）
		dbURL = "postgres://user:password@localhost:5432/lax_medic?sslmode=disable"
	}

	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	// 接続確認
	err = db.Ping()
	if err != nil {
		log.Printf("Warning: Could not connect to database at startup: %v", err)
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
			sharedPass = "admin123" // デフォルトパスワード
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
		rows, err := db.Query("SELECT id, occurred_at, patient_name, university, grade, position, location_detail, injury_detail, treatment, transport_needed, staff_contact, responder, remarks FROM casualties ORDER BY occurred_at DESC")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch casualties: " + err.Error()})
			return
		}
		defer rows.Close()

		casualties := []Casualty{}
		for rows.Next() {
			var cas Casualty
			err := rows.Scan(
				&cas.ID, &cas.OccurredAt, &cas.PatientName, &cas.University, &cas.Grade,
				&cas.Position, &cas.LocationDetail, &cas.InjuryDetail, &cas.Treatment,
				&cas.Transport, &cas.StaffContact, &cas.Responder, &cas.Remarks,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row: " + err.Error()})
				return
			}
			casualties = append(casualties, cas)
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

		query := `INSERT INTO casualties (
			patient_name, university, grade, position, location_detail, 
			injury_detail, treatment, transport_needed, staff_contact, 
			responder, remarks
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

		_, err := db.Exec(query,
			cas.PatientName, cas.University, cas.Grade, cas.Position, cas.LocationDetail,
			cas.InjuryDetail, cas.Treatment, cas.Transport, cas.StaffContact,
			cas.Responder, cas.Remarks,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert record: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Record created successfully"})
	})

	// ポート番号を環境変数から取得
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
