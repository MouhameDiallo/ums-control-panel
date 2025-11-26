import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NotificationWithTargets} from '../../core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"notifications/";

  getNotifications(skip: number = 0,
            limit: number=10){
    let params = new HttpParams().set("skip",skip).set("limit",limit);
    return this.http.get<NotificationWithTargets[]>(this.resourcePath, {params: params})
  }

  deleteNotification(id_notification: number) {
    return this.http.delete(this.resourcePath+id_notification,)
  }
}
