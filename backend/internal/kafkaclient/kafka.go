package kafkaclient

import (
	"github.com/SalyC/mentorhub/backend/internal/config"
	"github.com/segmentio/kafka-go"
)

func NewProducer(cfg config.KafkaConfig) *kafka.Writer {
	return &kafka.Writer{
		Addr:                   kafka.TCP(cfg.Brokers...),
		Balancer:               &kafka.LeastBytes{},
		RequiredAcks:           kafka.RequireOne,
		Async:                  false,
		AllowAutoTopicCreation: true,
	}
}

func NewConsumer(cfg config.KafkaConfig, groupID, topic string) *kafka.Reader {
	return kafka.NewReader(kafka.ReaderConfig{
		Brokers:     cfg.Brokers,
		GroupID:     groupID,
		Topic:       topic,
		MinBytes:    10e3,
		MaxBytes:    10e6,
		StartOffset: kafka.FirstOffset,
	})
}
