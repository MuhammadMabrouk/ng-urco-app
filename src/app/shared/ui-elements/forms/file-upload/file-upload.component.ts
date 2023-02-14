import { Component, AfterViewInit, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { FileUpload } from 'src/app/shared/ui-elements/forms/file-upload/file-upload';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';

// animations
import { slideFade } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [slideFade]
})
export class FileUploadComponent implements AfterViewInit {

  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('inputFile') inputFile: ElementRef;

  @Input() isBigArea: boolean;
  @Input() otherFieldRequired: boolean;
  @Input() progressComplete: boolean;
  @Input() progressPercent: number;
  @Input() multiple;

  @Output() fileChange = new EventEmitter();
  @Output() invalidUntil = new EventEmitter();

  files: FileUpload[] = [];

  constructor(private renderer: Renderer2, private globalJs: GlobalJsFunctionsService) {}

  ngAfterViewInit() {
    // highlight drag area
    $(this.inputFile.nativeElement).on('dragover focus click', () => {
      this.renderer.addClass(this.dropArea.nativeElement, 'active');
    });

    // back to normal state
    $(this.inputFile.nativeElement).on('dragleave blur drop', () => {
      this.renderer.removeClass(this.dropArea.nativeElement, 'active');
    });
  }

  // select a file
  selectFile() {
    this.fileChange.emit((this.inputFile.nativeElement as HTMLInputElement).files);
  }

  // click on the prevent layer
  invalidUntilLayerClicked() {
    this.invalidUntil.emit();
  }

  // get selected files from input type file
  getFiles() {
    const files = (this.inputFile.nativeElement as HTMLInputElement).files;

    this.files = Array.from(files).map((file: File) => {
      return {
        name: file.name,
        size: file.size,
        type: file.type
      };
    });

    this.selectFile();
  }

  // convert size in bytes to KB, MB, GB
  formatBytes(bytes, decimals?) {
    return this.globalJs.formatBytes(bytes, decimals);
  }
}
