import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserModel} from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient);
  resourcePath = environment.apiUrl+"users/";

  getUsers(skip: number = 0, limit: number=30){
    let params = new HttpParams().set("skip",skip).set("limit",limit);
    return this.http.get<UserModel[]>(this.resourcePath, {params: params})
  }

  updateUser(userid:number, user: UserModel){
    return this.http.put<UserModel>(this.resourcePath+userid, user)
  }

  createUser(user: UserModel){
    return this.http.post<UserModel>(this.resourcePath, user);
  }

  deleteUser(userId: number){
    return this.http.delete(this.resourcePath+userId);
  }

}
