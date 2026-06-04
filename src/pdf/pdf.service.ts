import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const PdfPrinter = require('pdfmake/build/pdfmake');
const vfs = require('pdfmake/build/vfs_fonts').pdfMake.vfs;

PdfPrinter.vfs = vfs;

@Injectable()
export class PdfService {
  generateBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdf = PdfPrinter.createPdf(docDefinition);
      pdf.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }
}
