import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {
    IS_SERVER = true;
    SERVER_URL = "localhost:3000";
    UWB_URL = "192.168.80.1";
    private API_BASE = "http://";

    private API_QUERY_ALL = "";
    private API_QUERY_ID = "";
    private API_NON = "";

    constructor(private httpClient: HttpClient) {
        if (this.IS_SERVER) {
            this.API_QUERY_ALL = this.API_BASE + this.SERVER_URL + "/tag/";
            this.API_QUERY_ID = this.API_BASE + this.SERVER_URL + "/tag?ID=";
            this.API_NON = this.API_BASE + this.SERVER_URL + "/no-exist/";
        }
        else {
            this.API_QUERY_ALL = this.API_BASE + this.UWB_URL + "/api/";
            this.API_QUERY_ID = this.API_BASE + this.UWB_URL + "/api/";
            this.API_NON = this.API_BASE + this.UWB_URL + "/no-exist/";
        }
    }

    public getAll() {
        return this.httpClient.get(this.API_QUERY_ALL);
    }

    public getID(id: string) {
        if(this.IS_SERVER){return this.httpClient.get(this.API_QUERY_ID + id);}
        return this.httpClient.get(this.API_QUERY_ID);
    }

    public getNon() {
        return this.httpClient.get(this.API_NON);
    }
}
