import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GalleryLightboxComponent, GalleryLightboxData } from './gallery-lightbox.component';

function setUp(data: GalleryLightboxData) {
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  TestBed.configureTestingModule({
    imports: [GalleryLightboxComponent],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: dialogRefSpy },
    ],
  });
  const component = TestBed.createComponent(GalleryLightboxComponent).componentInstance;
  return { component, dialogRefSpy };
}

describe('GalleryLightboxComponent', () => {
  const images = [
    { src: '/api/gallery/1/file', caption: 'Main Hall' },
    { src: '/api/gallery/2/file', caption: 'Garden' },
    { src: '/api/gallery/3/file', caption: null },
  ];

  it('starts showing the image at startIndex', () => {
    const { component } = setUp({ images, startIndex: 1 });

    expect(component.current()).toEqual(images[1]);
  });

  it('hasMultiple is false for a single-image gallery', () => {
    const { component } = setUp({ images: [images[0]], startIndex: 0 });

    expect(component.hasMultiple).toBeFalse();
  });

  it('next() advances to the following image and wraps around at the end', () => {
    const { component } = setUp({ images, startIndex: 2 });

    component.next();

    expect(component.current()).toEqual(images[0]);
  });

  it('previous() goes back and wraps around at the start', () => {
    const { component } = setUp({ images, startIndex: 0 });

    component.previous();

    expect(component.current()).toEqual(images[2]);
  });

  it('ArrowRight key advances to the next image', () => {
    const { component } = setUp({ images, startIndex: 0 });

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(component.current()).toEqual(images[1]);
  });

  it('ArrowLeft key goes to the previous image', () => {
    const { component } = setUp({ images, startIndex: 1 });

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    expect(component.current()).toEqual(images[0]);
  });

  it('arrow keys do nothing when there is only one image', () => {
    const { component } = setUp({ images: [images[0]], startIndex: 0 });

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(component.current()).toEqual(images[0]);
  });

  it('close() closes the dialog', () => {
    const { component, dialogRefSpy } = setUp({ images, startIndex: 0 });

    component.close();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
