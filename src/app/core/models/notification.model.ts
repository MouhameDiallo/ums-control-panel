import {CibleModel} from './cible.model';

export interface NotificationModel{
  id_notification: number
  id_user: number
  date_creation: Date
  titre: string
  message: string
}

export interface NotificationWithTargets{
  id_notification: number
  id_user: number
  date_creation: Date
  titre: string
  message: string
  cibles: CibleModel[]
}
