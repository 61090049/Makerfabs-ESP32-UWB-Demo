import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
    users : any[] = [];
    observableInterval : any;
    observableAPI : any;

    A0_TO_A1 = 0.5;
    A1_TO_A2 = 1;
    A2_TO_A3 = 1;

    canvas = document.getElementById('mini-canvas');

    constructor(private apiService : ApiService) {}

    ngOnInit(): void {
        this.observableInterval = interval(10000).subscribe(() =>{
            this.observableAPI = this.apiService.get().subscribe((data: any) => {
                //console.log(data);
                this.users = data;
                //this.users.forEach(tag => this.updateMiniMap(tag))
                this.observableAPI.unsubscribe();
            });
        })
    }

    ngOnDestroy(){
        this.observableInterval.unsubscribe();
    }

    updateMiniMap(tag: any) : void {
        var anchor_count = tag.Anchor.length;

        var position = this.calc2A(tag.Anchor);
        var t0_slip = 'translate(' + 0+ ',' + 0+ ')';
        var a0_slip = 'translate(' + position[0]*10+ ',' +position[1]*10 + ')';
        var a1_slip = 'translate(' + position[2]*10+ ',' +position[3]*10 + ')';
        /*
            x: 5-220 => 216
            y: 5-168 => 164
        */

        document.getElementById('tag-key')?.setAttribute('transform',t0_slip);
        document.getElementById('anchor1-key')?.setAttribute('transform',a0_slip);
        document.getElementById('anchor2-key')?.setAttribute('transform',a1_slip);

        //for(let i=0;i<anchor_count;i++){
            //document.getElementById('anchor-key')?.setAttribute tag.Anchor[i].Range
        //}

        /*
        var pDraw = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        pDraw.setAttribute('class','anchor');
        pDraw.setAttribute('x','91%');
        pDraw.setAttribute('y','4%');
        pDraw.setAttribute('rx','100%');
        pDraw.setAttribute('ry','100%');
        pDraw.setAttribute('width','16px');
        pDraw.setAttribute('height','16px');
        pDraw.setAttribute('visibility','visible');
        canvas?.appendChild(pDraw);
        console.log(pDraw)

        var pLabel = document.createElementNS("http://www.w3.org/2000/svg",'text');
        pDraw.setAttribute('class','anchor-label-bottom');
        pDraw.setAttribute('x','');
        pDraw.setAttribute('y','');
        pDraw.setAttribute('rx','');
        pDraw.setAttribute('ry','');
        pDraw.setAttribute('width','');
        pDraw.setAttribute('height','');
        pDraw.setAttribute('visibility','');
        
        canvas?.appendChild(pLabel);
        */

    }

    calc2A(anchors:any){
        let a0 = anchors[0].Range;
        let a1 = anchors[1].Range;
        if(a0+a1 <= this.A0_TO_A1){return [];}
        let tag_cos = (a1**2 + a0**2 - this.A0_TO_A1**2)/(2*a1*a0);
        let tag_sin = Math.sqrt(1-tag_cos**2);
        //rounding function + mul
        return [0,Math.round(a0*10),Math.round(a1*tag_cos*10),Math.round(a1*tag_sin*10)];
        //non-rounding function
        //return [0,a0*1,a1*tag_cos,a1*tag_sin];
    }

}
