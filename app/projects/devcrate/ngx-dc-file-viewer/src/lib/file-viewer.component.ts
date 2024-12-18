import { ScrollingModule } from "@angular/cdk/scrolling";
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { Component, ContentChild, ElementRef, HostBinding, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgxDcFileService } from "@devcrate/ngx-dc-utils";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { NgxDcAuthImgSrcDirective } from "./directives/auth-img-src.directive";
import { NgxDcAuthPdfSrcDirective } from "./directives/auth-pdf-src.directive";
import { NgxDcFileViewerErrorDirective, NgxDcFileViewerNotSupportedFileDirective } from "./file-viewer.directives";

@Component({
  selector: 'ngx-dc-file-viewer',
  standalone: true,
  exportAs: 'fileViewer',
  imports: [
    MatDialogModule,
    ScrollingModule,
    MatButtonModule,
    MatIconModule,
    PdfViewerModule,
    MatProgressBarModule,
    PdfViewerModule,
    AsyncPipe,
    NgxDcAuthPdfSrcDirective,
    NgxDcAuthImgSrcDirective,
    NgTemplateOutlet,
  ],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss',
  encapsulation: ViewEncapsulation.None,
})
/**
 * ### **Examples:**
 *
 * ```html
 * <!-- To view a local image -->
 * <ngx-dc-file-viewer fileName="file.name" [file]="file"></ngx-dc-file-viewer>
 * <!-- To view a local pdf -->
 * <ngx-dc-file-viewer fileName="file.name" [file]="file" pdfHeight="500px" pdfWidth="300px"></ngx-dc-file-viewer>
 *
 * <!-- To view an image -->
 * <ngx-dc-file-viewer fileName="myfile.png" fileUrl="/api/docs/myfile.png"></ngx-dc-file-viewer>
 *
 * <!-- To view a PDF -->
 * <ngx-dc-file-viewer fileName="myfile.pdf" fileUrl="/api/docs/myfile.pdf" pdfHeight="500px" pdfWidth="300px"></ngx-dc-file-viewer>
 * ```
 */
export class FileViewerComponent {
  @ViewChild(NgxDcAuthImgSrcDirective, { static: false })
  public imageSrc: NgxDcAuthImgSrcDirective

  @ViewChild(NgxDcAuthPdfSrcDirective, { static: false })
  public pdfSrc: NgxDcAuthPdfSrcDirective

  @ContentChild(NgxDcFileViewerNotSupportedFileDirective) public notSupportedFileContent: NgxDcFileViewerNotSupportedFileDirective

  @ContentChild(NgxDcFileViewerErrorDirective) public errorContent: NgxDcFileViewerErrorDirective

  @HostBinding("class.pdf")
  public isPdf = false

  @HostBinding("class.image")
  public isImage = false

  @Input({ required: true }) fileName: string
  @Input() fileUrl: string
  @Input() fitToContainer: boolean = false
  @Input() file: File

  private _height: string
  private get parentRect(): DOMRect {
    return this.elementRef?.nativeElement?.parentElement?.getBoundingClientRect()
  }
  @Input() set height(h: string) {
    this._height = h
  }
  public get height(): string {
    return this.fitToContainer
      ? `${this.parentRect?.height}px` || this._height
      : this._height
  }

  private _width: string
  @Input() set width(w: string) {
    this._width = w
  }
  public get width(): string {
    return this.fitToContainer
      ? `${this.parentRect?.width}px` || this._width
      : this._width
  }

  constructor(
    public apiService: NgxDcFileService,
    private elementRef: ElementRef<HTMLElement>,
  ) {  }

  public get disabled() {
    return this.pdfSrc?.loading?.value || this.imageSrc?.loading?.value || false
  }
  public ngOnInit(): void {
    this.isImage = this.fileName.endsWith('jpeg')
      || this.fileName.endsWith('jpg')
      || this.fileName.endsWith('gif')
      || this.fileName.endsWith('svg')
      || this.fileName.endsWith('png')
    this.isPdf = this.fileName.endsWith('pdf')
  }

  public onError(event: any) {
    this.pdfSrc.error = event.toString()
  }

  /**
   * Meant to be called by grabbing the component from the parent component
   *
   * It will download the file.
   *
   * ### **Examples:**
   *
   * ```html
   * <ngx-dc-file-viewer #fileViewer fileName="file.name" [file]="file"></ngx-dc-file-viewer>
   *
   * <button (click)="fileViewer.downloadFile()">Download</button>
   * ```
   */
  public async downloadFile() {
    if (this.pdfSrc?.file || this.imageSrc?.file) {
      await this.apiService.downloadFileLocal(this.file)
    } else {
      const filePart = this.fileName.split('.')
      await this.apiService.downloadFile(this.fileName, this.fileUrl, filePart[filePart.length - 1])
    }
  }


  /**
   * Meant to be called by grabbing the component from the parent component
   *
   * It will open the file in a new tab
   *
   * ### **Examples:**
   *
   * ```html
   * <ngx-dc-file-viewer #fileViewer fileName="file.name" [file]="file"></ngx-dc-file-viewer>
   *
   * <button (click)="fileViewer.openNewFile()">Download</button>
   * ```
   */
  public async openNewFile() {
    if (this.pdfSrc?.file || this.imageSrc?.file) {
      await this.apiService.openFileInNewTabFromFile(this.file)
    } else {
      await this.apiService.openFileInNewTab(this.fileUrl, this.isPdf)
    }
  }
}
