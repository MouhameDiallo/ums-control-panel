import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UniversityEvent} from '../../core/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"events/";

  getEvents(skip: number = 0,
            limit: number=10){
    return this.http.get<UniversityEvent[]>(this.resourcePath)
  }
}
