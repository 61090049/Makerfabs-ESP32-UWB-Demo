import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private API_BASE = "http://localhost:3000/tag/";
    private API_QUERY_ID = "http://localhost:3000/tag/";
    private API_NON = "http://localhost:3000/no-exist/";
    constructor(private httpClient : HttpClient) { }

    public getAll(){
        return this.httpClient.get(this.API_BASE);
    }

    public getID(){
        return this.httpClient.get(this.API_QUERY_ID);
    }

    public getNon(){
        return this.httpClient.get(this.API_NON);
    }
}
