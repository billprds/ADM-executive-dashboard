package config

import (
    "errors"
    "os"
    "github.com/spf13/viper"
)

type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
}

type ServerConfig struct {
    Port           string
    FrontendOrigin string
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    Name     string
    SSLMode  string
}

func (d DatabaseConfig) DSN() string {
    return "postgres://" + d.User + ":" + d.Password + "@" + d.Host + ":" + d.Port + "/" + d.Name + "?sslmode=" + d.SSLMode
}

const DefaultFile = ".env"

func Load() (*Config, error) {
    viper.SetConfigFile(DefaultFile)
    viper.AddConfigPath(".")
    viper.AutomaticEnv()

    if err := viper.ReadInConfig(); err != nil && !errors.Is(err, os.ErrNotExist) {
        return nil, err
    }

    viper.SetDefault("SERVER_PORT", "8081")
    viper.SetDefault("DB_PORT", "5432")
    viper.SetDefault("DB_SSL_MODE", "disable")
    viper.SetDefault("FRONTEND_ORIGIN", "http://localhost:5174")

    return &Config{
        Server: ServerConfig{
            Port:           viper.GetString("SERVER_PORT"),
            FrontendOrigin: viper.GetString("FRONTEND_ORIGIN"),
        },
        Database: DatabaseConfig{
            Host:     viper.GetString("DB_HOST"),
            Port:     viper.GetString("DB_PORT"),
            User:     viper.GetString("DB_USER"),
            Password: viper.GetString("DB_PASSWORD"),
            Name:     viper.GetString("DB_NAME"),
            SSLMode:  viper.GetString("DB_SSL_MODE"),
        },
    }, nil
}