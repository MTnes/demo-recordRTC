import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideojsRecordComponent } from './videojs-record/videojs-record.component';
import { RtcComponent } from './rtc/rtc.component';
import { RecordRtcTryComponent } from './record-rtc-try/record-rtc-try.component';

@NgModule({
  declarations: [
    AppComponent,
    VideojsRecordComponent,
    RtcComponent,
    RecordRtcTryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
