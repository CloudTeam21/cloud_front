import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AwsServiceService } from '../service/aws-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar'; 

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css'],
})
export class UploadFormComponent {
  constructor(
    public dialogRef: MatDialogRef<UploadFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public awsService: AwsServiceService, 
    public snackBar: MatSnackBar
  ) {}

  fileToUpload?: File = undefined;
  uploadFileGroup: FormGroup = new FormGroup({
    caption: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    basicfile: new FormControl('', [
      Validators.required,
    ]),
  });

  onFileSelected(event: any) {
    // Get the selected file from the input event
    this.fileToUpload = event.target.files.item(0);
    const file: File = event.target.files[0];
  }

  uploadFile() {
    if (this.uploadFileGroup.valid) {
      // Create a FormData object to send the file as the request body
      const formData = new FormData();
      let type = '';
      let size = 0;
      let lastModified = 0;

      if (this.fileToUpload != null) {
        formData.append('file', this.fileToUpload);
        type = this.fileToUpload.type;
        size = this.fileToUpload.size;
        lastModified = this.fileToUpload.lastModified;

        console.log(type, size, lastModified, name);
      }

      // Send the POST request to your Lambda function
      this.awsService
        .uploadFile(type, lastModified, size, this.uploadFileGroup.value.caption, this.fileToUpload)
        ?.subscribe(
          (response) => {
            console.log('File uploaded successfully');
            this.closeDialog();
            this.snackBar.open('File uploaded successfully!', "", {duration: 2000});
          },
          (error) => {
            console.log('Error uploading file:', error);
          }
        );
    }
  }

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
}
