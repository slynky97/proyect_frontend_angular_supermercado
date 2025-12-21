import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
    providedIn: 'root'
})
export class PdfService {

    constructor() { }

    public exportToPdf(elementId: string, fileName: string): void {
        const data = document.getElementById(elementId);
        if (!data) {
            console.error(`Element with id ${elementId} not found`);
            return;
        }

        html2canvas(data, { scale: 2 }).then(canvas => {
            const imgWidth = 208;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const heightLeft = imgHeight;

            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const position = 0;
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
            pdf.save(fileName + '.pdf');
        });
    }
}
