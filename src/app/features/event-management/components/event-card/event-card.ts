import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UniversityEvent} from '../../../../core/models/event.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-event-card',
  imports: [
    DatePipe
  ],
  standalone: true,
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss'
})
export class EventCard implements OnInit{
  @Input({required: true}) eventToDisplay!: UniversityEvent;
  @Output() modalCloser = new EventEmitter();

  ngOnInit(): void {
  }

  closeModal(){
    this.modalCloser.emit();
  }

}
