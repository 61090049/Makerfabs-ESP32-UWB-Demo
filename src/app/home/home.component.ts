import { Component, OnDestroy, OnInit, Inject, Optional } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { interval, Observable, Subscription } from 'rxjs';
import { MatSnackBar} from '@angular/material/snack-bar';
import { MatAnchor } from '@angular/material/button';

const MAX_DISTANCE = 1000;
const GET_USERS_INTERVAL = 3000;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
    users : any[] = [];
    observableInterval : any;
    observableAPI : any;
    isCalibrating = false;
    sumCF = 0;
    countCF = 0;
    avgCF = 0.4; // Default average compensation factor for ToF.

    canvas = document.getElementById('mini-canvas');

    constructor(private apiService : ApiService, @Optional() private snackBar: MatSnackBar) {}

    ngOnInit(): void {
        this.observableInterval = interval(GET_USERS_INTERVAL).subscribe(() =>{
            this.observableAPI = this.apiService.getAll().subscribe((datas: any) => {
                this.users = [];
                datas.forEach((data: any) => {
                    let pos = this.getNearest(data).Range;
                    if(this.isCalibrating){
                        this.sumCF += pos;
                        this.countCF++;
                    }
                });
                
                //console.log(this.users);
                this.observableAPI.unsubscribe();
            });
        })
        window.onbeforeunload = () => this.ngOnDestroy();
    }

    ngOnDestroy(){
        this.observableInterval.unsubscribe();
    }
    
    getNearest(Entity: any): any{
        let Nearest = {EUI:0,Power:0,Range:MAX_DISTANCE}
        Entity.Anchor.forEach((anchor:any) => {
            if(anchor.Range<= Nearest.Range){
                Nearest = anchor;
            }
        });
        Nearest.Range -= this.avgCF;
        Nearest.Range = parseFloat(Nearest.Range.toFixed(2));

        //const nearest = {Nearest:};
        this.users.push({Nearest, Entity});
        return Nearest;
        //console.log(Nearest);
    }

    setCalibrateFactor():void{
        // Use function only when anchor distance -> 0
        this.avgCF = this.sumCF/this.countCF; 
    }

}
