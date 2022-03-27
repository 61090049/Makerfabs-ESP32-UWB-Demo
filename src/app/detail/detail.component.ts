import { Component, OnDestroy, OnInit } from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { interval } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {
    A0_TO_A1 = 0.5;
    A1_TO_A2 = 1;
    A2_TO_A3 = 1;

    observableInterval : any;
    observableAPI : any;

    lastPosition = 0;
    thisPosition = 0;
    title = 'Position Map';
    type = ChartType.Scatter;
    data = [
        [0, 5.0],
        [1, 10.0],
        [2, 2.0],
        [3, 3.0],
    ];
    columnNames = ['Name', 'Percentage'];
    options = {
    };
    width = 500;
    height = 300;

    constructor(private apiService : ApiService) {}

    ngOnInit(): void {
        this.observableInterval = interval(3000).subscribe(() => {
            this.observableAPI = this.apiService.getAll().subscribe((datas: any) => {

                console.log();
                this.observableAPI.unsubscribe();
            });
        })
    }

    ngOnDestroy(){
        this.observableInterval.unsubscribe();
    }

    updateMiniMap(tag: any): void {
        var anchor_count = tag.Anchor.length;

        var position = this.calc2A(tag.Anchor);
        var t0_slip = 'translate(' + 0 + ',' + 0 + ')';
        var a0_slip = 'translate(' + position[0] * 10 + ',' + position[1] * 10 + ')';
        var a1_slip = 'translate(' + position[2] * 10 + ',' + position[3] * 10 + ')';

        /*
            x: 5-220 => 216
            y: 5-168 => 164
        */

    }

    calc2A(anchors: any) {
        let a0 = anchors[0].Range;
        let a1 = anchors[1].Range;
        if (a0 + a1 <= this.A0_TO_A1) { return []; }
        let tag_cos = (a1 ** 2 + a0 ** 2 - this.A0_TO_A1 ** 2) / (2 * a1 * a0);
        let tag_sin = Math.sqrt(1 - tag_cos ** 2);
        //rounding function + mul
        return [0, Math.round(a0 * 10), Math.round(a1 * tag_cos * 10), Math.round(a1 * tag_sin * 10)];
        //non-rounding function
        //return [0,a0*1,a1*tag_cos,a1*tag_sin];
    }


}
