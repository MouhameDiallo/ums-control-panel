import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Sidebar} from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Sidebar
  ],
  standalone: true,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

}
