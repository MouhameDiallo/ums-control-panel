interface NotificationCreate {
  titre: string;
  message: string;
  media_url?: string;
  target_ids: number[];
}

interface NotificationResponse {
  message: string;
  tokens_sent_to: number;
}
