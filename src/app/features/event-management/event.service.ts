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
    return this.http.get<UniversityEvent[]>(this.resourcePath, {
      params: {
        skip: skip,
        limit: limit
      }
    })
  }

  createEvent(event: Partial<UniversityEvent>){
    return this.http.post<UniversityEvent>(this.resourcePath, event);
  }

  updateEvent(id: number, eventToUpdate: UniversityEvent) {
    return this.http.put<UniversityEvent>(this.resourcePath+id, eventToUpdate);
  }

  deleteEvent(id: number) {
    return this.http.delete<UniversityEvent>(this.resourcePath+id);
  }
}
