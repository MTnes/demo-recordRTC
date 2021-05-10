import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rtc',
  templateUrl: './rtc.component.html',
  styleUrls: ['./rtc.component.css']
})
export class RtcComponent implements AfterViewInit  {

  private stream: MediaStream;
  private recordRTC: any;

  serverUrl = 'https://video-feedback-portal-server.cleverapps.io/api/storeVideo';

  @ViewChild('video') video;
  @ViewChild('videoRecording') videoRecording;

  constructor(private http: HttpClient) {
    // Do stuff
  }

  ngAfterViewInit() {
    // set the initial state of the video
    let video:HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  successCallback(stream: MediaStream) {

    var options = {
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
    };
    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    let video: HTMLVideoElement = this.video.nativeElement;
    // video.src = window.URL.createObjectURL(stream);
    video.srcObject = stream;
    this.toggleControls();
  }

  errorCallback() {
    //handle error here
  }

  processVideo(audioVideoWebMURL) {
    let video: HTMLVideoElement = this.video.nativeElement;
    let recordRTC = this.recordRTC;
    video.srcObject = null;
    video.src = audioVideoWebMURL;
    video.play();
    this.toggleControls();
    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function (dataURL) { });
  }

  startRecording() {
    let mediaConstraints = {
      audio: true,
      video: {
        width: 1280,
        height: 720
      }
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  stopRecording() {
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());

    // const blob = this.recordRTC.getBlob();
    // const data = new FormData();
    // data.append("video", blob);
    // data.append("timestamp", new Date().toLocaleString());
    //
    // this.http.post<any>(this.serverUrl, data)
    //   .subscribe(
    //     (res) => console.log(res),
    //     (err) => console.log(err)
    //   );


  }

  download() {
    this.recordRTC.save('video.webm');
  }

}
