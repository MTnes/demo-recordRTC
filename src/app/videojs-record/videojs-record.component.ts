import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import videojs from 'video.js';
import * as adapter from 'webrtc-adapter/out/adapter_no_global.js';
import * as RecordRTC from 'recordrtc';

import * as Record from 'videojs-record/dist/videojs.record.js';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-videojs-record',
  templateUrl: './videojs-record.component.html',
  styleUrls: ['./videojs-record.component.css']
})
export class VideojsRecordComponent implements OnInit {

  // reference to the element itself: used to access events and methods
  private _elementRef: ElementRef

  private handleError(error: HttpErrorResponse) {
  if (error.status === 0) {
    // A client-side or network error occurred. Handle it accordingly.
    console.error('An error occurred:', error.error);
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong.
    console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
  }
  // Return an observable with a user-facing error message.
  return throwError(
    'Something bad happened; please try again later.');
}

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': undefined })
  };

  // index to create unique ID for component
  idx = 'clip1';

  private config: any;
  private player: any;
  private plugin: any;

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef, private http: HttpClient) {
    this.player = false;

    // save reference to plugin (so it initializes)
    this.plugin = Record;

    // video.js configuration
    this.config = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 320,
      height: 240,
      bigPlayButton: false,
      controlBar: {
        volumePanel: false
      },
      plugins: {
        /*
        // wavesurfer section is only needed when recording audio-only
        wavesurfer: {
            backend: 'WebAudio',
            waveColor: '#36393b',
            progressColor: 'black',
            debug: true,
            cursorWidth: 1,
            displayMilliseconds: true,
            hideScrollbar: true,
            plugins: [
                // enable microphone plugin
                WaveSurfer.microphone.create({
                    bufferSize: 4096,
                    numberOfInputChannels: 1,
                    numberOfOutputChannels: 1,
                    constraints: {
                        video: false,
                        audio: true
                    }
                })
            ]
        },
        */
        // configure videojs-record plugin
        record: {
          audio: true,
          video: true,
          debug: true
        }
      }
    };
  }

  ngOnInit() {}

  // use ngAfterViewInit to make sure we initialize the videojs element
  // after the component template itself has been rendered
  ngAfterViewInit() {
    // ID with which to access the template's video element
    let el = 'video_' + this.idx;

    // setup the player via the unique element ID
    this.player = videojs(document.getElementById(el), this.config, () => {
      console.log('player ready! id:', el);

      // print version information at startup
      var msg = 'Using video.js ' + videojs.VERSION +
        ' with videojs-record ' + videojs.getPluginVersion('record') +
        ' and recordrtc ' + RecordRTC.version;
      videojs.log(msg);
    });

    // device is ready
    this.player.on('deviceReady', () => {
      console.log('device is ready!');
    });

    // user clicked the record button and started recording
    this.player.on('startRecord', () => {
      console.log('started recording!');
    });

    // user completed recording and stream is available
    this.player.on('finishRecord', () => {
      // recordedData is a blob object containing the recorded data that
      // can be downloaded by the user, stored on server etc.
      console.log('finished recording: ', this.player.recordedData);
      var data = this.player.recordedData;
      var serverUrl = 'https://videojs-demo-default-rtdb.firebaseio.com/camera.json';
      var formData = new FormData();
      formData.append('file', data, data.name);

      console.log('uploading recording:', formData);

      this.http.post<any>('https://videojs-demo-default-rtdb.firebaseio.com/camera', formData, this.httpOptions)
        .subscribe(
          (res) => console.log(res),
          (err) => console.log(err)
        );

      // fetch(serverUrl, {
      //   method: 'POST',
      //   body: formData
      // }).then(
      //   success => console.log('recording upload complete.')
      // ).catch(
      //   error => console.error('an upload error occurred!')
      // );
    });

    // error handling
    this.player.on('error', (element, error) => {
      console.warn(error);
    });

    this.player.on('deviceError', () => {
      console.error('device error:', this.player.deviceErrorCode);
    });
  }

  // use ngOnDestroy to detach event handlers and remove the player
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = false;
    }
  }
}
