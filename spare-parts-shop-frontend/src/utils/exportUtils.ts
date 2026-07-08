import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export const exportToPDF = (
  title: string,
  headers: string[],
  data: (string | number)[][],
  filename: string
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (
  data: any[],
  filename: string
) => {
  if (!data || data.length === 0) return;
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  
  const firstItem = data[0];
  worksheet.columns = Object.keys(firstItem).map(key => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key: key,
    width: 20
  }));
  
  data.forEach(item => {
    worksheet.addRow(item);
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
