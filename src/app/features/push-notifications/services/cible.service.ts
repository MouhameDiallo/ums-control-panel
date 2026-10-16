import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CibleService {
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"targets/";

  loadCibles(){
    return this.http.get<Cible[]>(`${this.resourcePath}cibles`);
  }
}
