package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// CORS設定
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	// エンドポイント
	r.GET("/api/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World from Go and Gin!",
		})
	})

	// 8080ポートで起動
	r.Run(":8080")
}
