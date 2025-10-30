import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {UniversityEvent} from '../../../../core/models/event.model';
import {EventService} from '../../event.service';

@Component({
  selector: 'app-event-form',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss'
})
export class EventForm implements OnInit{
  @Input() eventToEdit!: UniversityEvent|null;
  @Output() modalCloser = new EventEmitter<void>();
  @Output() signalToReload = new EventEmitter<void>();
  eventForm!: FormGroup;
  categories: string[] = ["Tous", "Conférence", "Événement", "Atelier", "Séminaire", "Culture", "Forum"];

  constructor(private eventService: EventService,
              private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required]],
      location: ['', [Validators.required]],
      category: ['', Validators.required],
      image_url: ['', ],
    });
  }

  ngOnInit(): void {
    if (this.eventToEdit){
      this.eventForm.patchValue(this.eventToEdit);
    }
  }

  eventSubmit(): void {
    if (this.eventForm.valid){
      if (this.eventToEdit){
        const eventToUpdate = this.eventForm.value
        this.eventService.updateEvent(this.eventToEdit.id,eventToUpdate).subscribe({
          next: () => {
            this.signalToReload.emit();
          },
          error: err => {
            console.log("Une erreur s'est produite");
            console.error(err);
          },
          complete: () => this.closeModal(),
        })
      }else {
        const eventToCreate = this.eventForm.value
        this.eventService.createEvent(eventToCreate).subscribe({
          next: value => {
            console.log(value);
            this.signalToReload.emit();
          },
          error: err => {
            console.log("Une erreur s'est produite");
            console.error(err);
          },
          complete: () => this.closeModal(),
        })
      }
    }
  }

  closeModal(): void {
    this.modalCloser.emit();
  }
}
