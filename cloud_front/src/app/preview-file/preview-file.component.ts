import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AwsServiceService } from '../service/aws-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar'; 
import {MatChipEditedEvent, MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { AuthService, IUser } from '../service/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { File } from '../model/files';

@Component({
  selector: 'app-upload-form',
  templateUrl: './preview-file.component.html',
  styleUrls: ['./preview-file.component.css'],
})

export class PreviewFileComponent implements OnInit {
  
  file!: File;

  constructor(private router: Router, private awsService: AwsServiceService, 
    private snackBar: MatSnackBar,) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.file = navigation.extras.state['file'];
    }
  }

  public ngOnInit(): void {
    if (this.file.metadata.type === 'application/pdf') {
      this.showPDF(this.file.content.substr(2, this.file.content.length - 3), this.file.metadata.type);
    }
  }

  showPDF(base64String: string, contentType: string): void {
    const decodedContent = atob(base64String);
    const uint8Array = new Uint8Array(decodedContent.length);
    for (let i = 0; i < decodedContent.length; i++) {
      uint8Array[i] = decodedContent.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
  
    const embedElement = document.getElementById('pdfEmbed');
    if (embedElement instanceof HTMLObjectElement) {
      embedElement.data = blobUrl;
    }
  }

  base64ToBlob(base64String: string, contentType: string): Blob {
    const binaryString = atob(base64String);
    const byteNumbers = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteNumbers[i] = binaryString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  getBase64(conent: string, type: string): string {
    console.log('data:' + type + ';base64,' + conent)
    return 'data:' + type + ';base64,' + conent.substring(2, this.file.content.length-1);
  }

  base64ToString(base64String: string): string {
    const decodedData = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    const textDecoder = new TextDecoder('utf-8');
    const decodedString = textDecoder.decode(decodedData);
    return decodedString;
  }

  async deleteFile() {
    this.snackBar.open('File deleted dsadadasdasd', 'Close', {
      duration: 3000
    });
    (await this.awsService.deleteFile(this.file)).subscribe(
      (response: any) => {
        console.log('File deleted successfully');
        this.snackBar.open('File deleted successfully', 'Close', {
          duration: 3000
        });
        // Refresh the file list or update UI as needed
      },
      (error: any) => {
        console.error('Failed to delete file:', error);
        this.snackBar.open('Failed to delete file', 'Close', {
          duration: 3000
        });
      }
    );
    }
}