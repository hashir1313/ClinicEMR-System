import { jsPDF } from 'jspdf';
import { clinicInfo, ClinicInfo } from './print-config';
import type { Patient, Visit, Doctor } from '@/types';

export interface VisitPrintData {
  patient: Patient;
  visit: Visit;
  doctor: Doctor;
}

interface PDFSection {
  x: number;
  y: number;
  width: number;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const LINE_HEIGHT = 6;

function mmToPt(mm: number): number {
  return mm;
}

function createSection(x: number, y: number, width: number): PDFSection {
  return { x, y, width };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function wrapText(text: string, maxWidth: number, doc: jsPDF): string[] {
  if (!text) return [];
  const lines = doc.splitTextToSize(text, maxWidth);
  return Array.isArray(lines) ? lines : [lines];
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export async function generateVisitPDF(data: VisitPrintData): Promise<jsPDF> {
  const { patient, visit, doctor } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = MARGIN;
  const contentWidth = PAGE_WIDTH - 2 * MARGIN;
  const section = createSection(MARGIN, currentY, contentWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(clinicInfo.name, PAGE_WIDTH / 2, currentY, { align: 'center' });
  currentY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(clinicInfo.address, PAGE_WIDTH / 2, currentY, { align: 'center' });
  currentY += 4;
  doc.text(`Tel: ${clinicInfo.phone} | Email: ${clinicInfo.email}`, PAGE_WIDTH / 2, currentY, { align: 'center' });
  currentY += 8;

  doc.setDrawColor(150);
  doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('VISIT RECORD', PAGE_WIDTH / 2, currentY, { align: 'center' });
  currentY += 10;

  currentY = await printPatientInfo(doc, patient, visit, currentY, section);
  currentY += 5;

  currentY = printVisitDetails(doc, visit, currentY, section);
  currentY += 5;

  if (visit.prescription_image_url) {
    currentY = await printPrescription(doc, visit.prescription_image_url, currentY, section);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('No prescription attached', section.x, currentY);
    currentY += 10;
    doc.setTextColor(0);
  }

  currentY += 10;
  currentY = printFooter(doc, doctor, currentY, section);

  return doc;
}

async function printPatientInfo(
  doc: jsPDF,
  patient: Patient,
  visit: Visit,
  startY: number,
  section: PDFSection
): Promise<number> {
  let y = startY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Patient Information', section.x, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const patientInfo = [
    `Name: ${patient.full_name}`,
    `Age: ${patient.age} years`,
    `Gender: ${patient.gender}`,
    `Phone: ${patient.phone}`,
    `Visit Date: ${formatDate(visit.created_at)}`,
  ];

  patientInfo.forEach((line) => {
    doc.text(line, section.x, y);
    y += LINE_HEIGHT;
  });

  return y;
}

function printVisitDetails(
  doc: jsPDF,
  visit: Visit,
  startY: number,
  section: PDFSection
): number {
  let y = startY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Visit Details', section.x, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const details = [
    { label: 'Symptoms', value: visit.symptoms },
    { label: 'Diagnosis', value: visit.diagnosis },
    { label: 'Notes', value: visit.notes },
  ];

  details.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, section.x, y);
    doc.setFont('helvetica', 'normal');
    
    if (value) {
      const wrappedLines = wrapText(value, section.width - 30, doc);
      wrappedLines.forEach((line) => {
        doc.text(line, section.x + 30, y);
        y += LINE_HEIGHT;
      });
    } else {
      doc.text('-', section.x + 30, y);
      y += LINE_HEIGHT;
    }
    y += 2;
  });

  if (visit.follow_up_date) {
    doc.setFont('helvetica', 'bold');
    doc.text('Follow-up Date:', section.x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(visit.follow_up_date), section.x + 30, y);
    y += LINE_HEIGHT;
  }

  return y;
}

async function printPrescription(
  doc: jsPDF,
  imageUrl: string,
  startY: number,
  section: PDFSection
): Promise<number> {
  let y = startY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Prescription', section.x, y);
  y += 6;

  try {
    const dataUrl = await loadImageAsDataUrl(imageUrl);
    
    if (dataUrl) {
      const imgWidth = section.width;
      const maxImgHeight = 100;
      
      doc.addImage(dataUrl, 'PNG', section.x, y, imgWidth, maxImgHeight);
      y += maxImgHeight + 5;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Failed to load prescription image', section.x, y);
      y += 10;
      doc.setTextColor(0);
    }
  } catch {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Prescription image not available', section.x, y);
    y += 10;
    doc.setTextColor(0);
  }

  return y;
}

function printFooter(
  doc: jsPDF,
  doctor: Doctor,
  startY: number,
  section: PDFSection
): number {
  let y = startY;

  if (y > PAGE_HEIGHT - 40) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setDrawColor(150);
  doc.line(section.x, y, PAGE_WIDTH - section.x, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.setFont('helvetica', 'bold');
  doc.text(`Dr. ${doctor.email.split('@')[0]}`, section.x, y);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: _______________', PAGE_WIDTH - MARGIN - 40, y);
  y += LINE_HEIGHT;

  doc.setFontSize(8);
  doc.setTextColor(150);
  const timestamp = `Generated: ${formatDateTime(new Date().toISOString())}`;
  doc.text(timestamp, PAGE_WIDTH / 2, y, { align: 'center' });

  return y;
}

export async function generateAndPrintVisit(data: VisitPrintData): Promise<void> {
  const doc = await generateVisitPDF(data);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    alert('Please allow popups to print');
    doc.save('visit-record.pdf');
  }
}