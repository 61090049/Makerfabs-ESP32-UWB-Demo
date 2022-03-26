import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private API_LOC = "http://localhost:3000/tag/";
    //For testing spinning loader
    //private API_LOC = "http://localhost:3000/no-exist/";
    constructor(private httpClient : HttpClient) { }

    public get(){
        return this.httpClient.get(this.API_LOC);
    }
}
