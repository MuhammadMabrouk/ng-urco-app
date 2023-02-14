import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  // permission to the parent component to close the modal
  @Output() cancelEvent = new EventEmitter();

  // flag to toggle the modal
  // tslint:disable-next-line: variable-name
  private _isOpen: boolean;

  @Input() set isOpen(value: boolean) {
    this._isOpen = value;

    const bodyElement = this.render.selectRootElement('body', true);

    if (value) { this.render.setStyle(bodyElement, 'overflowY', 'hidden');
    } else { this.render.setStyle(bodyElement, 'overflowY', ''); }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  // get the modal title
  @Input() modalTitle: string = 'Modal title';

  constructor(private render: Renderer2) { }

  // close the modal
  closeModal() {
    this.cancelEvent.emit();
  }
}
