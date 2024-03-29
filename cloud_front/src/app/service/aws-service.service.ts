import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { FilesResponse } from '../model/files';
import { File as File2 } from '../model/files';

@Injectable({
  providedIn: 'root',
})
export class AwsServiceService {

  private endpoint =
    'https://78w51v1ay5.execute-api.eu-central-1.amazonaws.com/dev/';

  private jwt: string = '';
  private headers = new HttpHeaders({Authorization: ''});

  constructor(private http: HttpClient, private cognitoService: AuthService) {}

  public uploadFile(
    type: string,
    lastModified: number,
    size: number,
    caption: string,
    tags: string[],
    file?: File,
    foldername?: string
  ) {
    this.getToken();

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Observable((observer) => {
        reader.onloadend = () => {
          const content = reader.result as string;
          const requestBody = {
            file: {
              filename: file.name,
              content: content.split(',')[1],
              type: type,
              lastModified: lastModified,
              size: size,
              caption: caption,
              tags: tags,
              foldername: foldername
            },
          };
          this.http
            .post(this.endpoint + "file", JSON.stringify(requestBody), { headers: this.headers })
            .subscribe(
              (response) => {
                observer.next(response);
                observer.complete();
              },
              (error) => observer.error(error)
            );
        };
      });
    } else {
      return new Observable();
    }
  }

  private async getToken() {
    await this.cognitoService.getToken().then((res) => {
      console.log(res);
      this.jwt = res;

      console.log(this.jwt);
      this.headers = new HttpHeaders({
        Authorization: this.jwt,
      });
    });
  }

  public async getFiles(folderName: string): Promise<Observable<FilesResponse>> {
    await this.getToken();
    let path = folderName.replace(/\//g, "-");
    return this.http.get<FilesResponse>(this.endpoint + "files/" + path, { headers: this.headers}).pipe();
  }

  public async getAlbums(folderName: string): Promise<Observable<any>> {
    await this.getToken();
    return this.http.get(this.endpoint + "album/" + folderName, { headers: this.headers });
  }

  public async createAlbum(folderName: string): Promise<Observable<any>> {
    await this.getToken();
    return this.http.post(this.endpoint + "album", {"foldername": folderName}, { headers: this.headers });
  }


  public async deleteAlbum(folderName: string): Promise<Observable<any>> {
    await this.getToken();
    let path = folderName.replace(/\//g, "-");
    return this.http.delete(this.endpoint + "album/" + path, { headers: this.headers });
  }

  public async deleteFile(file: File2): Promise<Observable<any>>  {
    await this.getToken();
    let path = file.metadata.file.replace(/\//g, "-")
    return this.http.delete(this.endpoint + 'file/' + path, { headers: this.headers });
  }

  public async editFile(caption: any, tags: string[], file_path: string): Promise<Observable<any>> {
    await this.getToken();
    const requestBody = {
      file_path: file_path,
      caption: caption,
      tags: tags
    };
    return this.http.put(this.endpoint + 'file/', requestBody, { headers: this.headers });
  }

  public async registerByInvite(requestBody: any): Promise<Observable<any>> {
    return this.http.post(this.endpoint + 'register-by-invite/', requestBody);
  }

  public async moveFile(move: string, file_path: string): Promise<Observable<any>> {
    await this.getToken();
    const requestBody = {
      old_file_path: file_path,
      new_file_path: move
    };
    return this.http.put(this.endpoint + 'file/move', requestBody, {headers: this.headers});
  }

  public async downloadFile(file: File2): Promise<Observable<any>>  {
    console.log("POZVAN DOWNLOAD IZ AWS SERVISA")
    await this.getToken();
    let filename = file.metadata.file.replace("/","-");
    return this.http.get(this.endpoint + 'file/download/' + filename, { headers: this.headers });
  }

  public async shareFile(file_path: string, usernames: string[]): Promise<Observable<any>> {
    await this.getToken();
    const requestBody = {
      file: file_path,
      usernames: usernames
    };
    return this.http.post(this.endpoint + 'file/share', requestBody, { headers: this.headers });
  }

  public async shareFolder(folder: string, usernames: string[]): Promise<Observable<any>> {
    await this.getToken();
    const requestBody = {
      folder: folder,
      usernames: usernames
    };
    return this.http.post(this.endpoint + 'folder/share', requestBody, { headers: this.headers });
  }

  public async getAlbumsSharedWith(file: string): Promise<Observable<any>> {
    await this.getToken();
    const path = file.replace(/\//g, "-")
    return this.http.get(this.endpoint + 'folder/share/' + path, { headers: this.headers });
  }
  public async processInvite(path: string): Promise<Observable<any>>  {
    await this.getToken();
    console.log(this.headers);
    return this.http.put(this.endpoint + 'invite/' + path, null,{ headers: this.headers });
  }
}
