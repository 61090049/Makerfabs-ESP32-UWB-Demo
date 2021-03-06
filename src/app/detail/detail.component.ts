import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { interval, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';

const RESPONSE_DUR = 5000;
const RET_GET_THRESHOLD = 5;
const RET_CAL_THRESHOLD = 8;
const GET_POS_INTERVAL = 3000;
const TAG_COLOR = 'color:green';
const ANCHOR_COLOR = 'color:orange';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {
    _user: any;

    A0_TO_A1 = 0.5;
    A1_TO_A2 = 1;
    A2_TO_A3 = 1;
    COMPENSATOR = 0.4;
    EFF_SCALE = 4;

    retryGetCount = 0;
    retryCalCount = 0;
    getStatus = false;

    observableInterval: any;
    observableAPI: any;

    lastPosition = 0;
    thisPosition = 0;
    title = '';
    type = ChartType.ScatterChart;
    roles = [];
    cdata: any = [[0, 0, '', 'color:crimson']];
    columnNames = ['', '', {role:'annotation'}, {role:'style'}];
    options = {
        legend: { position: 'none' },
        hAxis: { minValue: -100, maxValue: 100, gridlines: { count: 1 } },
        vAxis: { minValue: -100, maxValue: 100, gridlines: { count: 1 } },
        pointSize: 50,
        pointShape: 'circle',
        backgroundColor: { fill: 'transparent' }
    };
    width = 700;
    height = 500;

    constructor(private apiService: ApiService,
        @Optional() private snackBar: MatSnackBar,
        private location: Location) {
    }

    ngOnInit(): void {
        try {
            this._user = history.state.data;
            console.log(this._user);

            this.observableInterval = interval(GET_POS_INTERVAL).subscribe(() => {
                try {
                    this.observableAPI = this.apiService.getID(this._user.ID).subscribe((datas: any) => {
                        this.getStatus = this.updateMiniMap(datas[0]);
                        this.retryGetCount = 0;
                        this.observableAPI.unsubscribe();
                        //console.log(this._user);
                    });
                } catch (error) {
                    this.retryGetCount++;
                    if (this.retryGetCount >= RET_GET_THRESHOLD) {
                        let snackBarRef = this.snackBar.open('No incoming data stream.', 'Go Back', { duration: RESPONSE_DUR });
                        this.observableInterval.unsubscribe();
                        snackBarRef.afterDismissed().subscribe(() => {
                            this.location.back();
                            console.log('Returning to homepage.');
                        });
                    }
                    console.error("ERR: No data packets recieved.");
                }
            })

        } catch (error) {
            let snackBarRef = this.snackBar.open('No such user exist.', 'Go Back', { duration: RESPONSE_DUR });
            snackBarRef.afterDismissed().subscribe(() => {
                this.location.back();
                console.log('Returning to homepage.');
            });
            console.error("ERR:No user data found");
        }
        
        window.onbeforeunload = () => this.ngOnDestroy();
    }

    ngOnDestroy() {
        try{this.observableInterval.unsubscribe();}
        catch(error){console.error("DEBUG ONLY: Page in abnormal state due to manual URI input.")}
    }

    updateMiniMap(tag: any): boolean {
        //var anchor_count = tag.Anchor.length;
        var position = this.calc2A(tag.Anchor);
        //console.log(tag.Anchor);
        try {
            this.cdata = [
                [position[0][0], position[0][1], this._user.Name, TAG_COLOR],
                [position[1][0]-this.COMPENSATOR, position[1][1], tag.Anchor[0].EUI, ANCHOR_COLOR],
                [position[2][0]-this.COMPENSATOR, position[2][1]-this.COMPENSATOR, tag.Anchor[1].EUI, ANCHOR_COLOR],
            ];
            //console.log(position[0][0]);
            //console.log(typeof(position[0][0]));
        } catch (error) {
            this.retryCalCount++;
            if (this.retryCalCount >= RET_CAL_THRESHOLD) {
                let snackBarRef = this.snackBar.open('UWB Modules may need recalibration.', 'Go Back', { duration: RESPONSE_DUR });
                this.observableInterval.unsubscribe();
                snackBarRef.afterDismissed().subscribe(() => {
                    this.location.back();
                    console.log('Returning to homepage.');
                });
            }
            console.error("ERR: Invalid variable(s) in trilateration process.")
            return false;
        }

        let scale = this.getMaxScale(this.cdata);
        //console.log(scale);
        this.options = {
            legend: { position: 'none' },
            hAxis: {
                minValue: -this.EFF_SCALE, maxValue: this.EFF_SCALE,
                gridlines: { count: 100 }
            },
            vAxis: {
                minValue: -this.EFF_SCALE, maxValue: this.EFF_SCALE,
                gridlines: { count: 100 }
            },
            pointSize: 10,
            pointShape: 'circle',
            backgroundColor: { fill: 'transparent' }
        };

        this.cdata = Object.assign([], this.cdata)
        return true;
        //console.log(this.cdata);
        /*
        var t0_slip = 'translate(' + 0 + ',' + 0 + ')';
        var a0_slip = 'translate(' + position[0] * 10 + ',' + position[1] * 10 + ')';
        var a1_slip = 'translate(' + position[2] * 10 + ',' + position[3] * 10 + ')';
        */
    }

    calc2A(anchors: any) {
        let a0 = anchors[0].Range * 1;
        let a1 = anchors[1].Range * 1;
        if ((a0 + a1 <= this.A0_TO_A1) || (a0 + this.A0_TO_A1 <= a1) || (a1 + this.A0_TO_A1 <= a0)) { return []; }
        let tag_cos = (a1 ** 2 + a0 ** 2 - this.A0_TO_A1 ** 2) / (2 * a1 * a0);
        let tag_sin = Math.sqrt(1 - tag_cos ** 2);
        return [[0, 0], [a0 * 1, 0], [a1 * tag_cos, a1 * tag_sin]];
    }

    getMaxScale(table: any) {
        let x = 0;
        let y = 0;
        table.forEach((element: any, index: any) => {
            if (element[0] > x) (x = element[0])
            if (element[1] > y) (y = element[1])
        });
        return [x, y];
    }
}
