import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {PlaceModel} from '../../core/models/place.model';

@Injectable({
  providedIn: 'root'
})
export class PlaceService{
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"lieux/";

  getPlaces(skip: number = 0, limit: number=30) {
    let params = new HttpParams().set("skip",skip).set("limit",limit);
    return this.http.get<PlaceModel[]>(this.resourcePath, {params: params})
  }

  deleteUser(id: number) {
    return this.http.delete(this.resourcePath+id,);
  }

  updatePlace(id: number, payload: any) {
    return this.http.put<PlaceModel>(this.resourcePath+id,payload);
  }

  createPlace(payload: any) {
    return this.http.post<PlaceModel>(this.resourcePath,payload);
  }
}
