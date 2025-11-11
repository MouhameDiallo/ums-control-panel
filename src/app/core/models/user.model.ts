export interface UserModel {
  id_user: number;
  login: string;
  role: 'admin' | 'user';
}
