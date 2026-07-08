package com.spareparts.service;

import com.spareparts.model.Bill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountingExportService {

    @Autowired
    private BillService billService;

    public String exportToQuickBooksCsv(LocalDateTime startDate, LocalDateTime endDate) {
        List<Bill> bills = billService.getBillsByDateRange(startDate, endDate);
        StringBuilder csv = new StringBuilder();
        
        // QuickBooks standard headers for Invoices
        csv.append("InvoiceNo,Customer,Date,DueDate,Terms,Item,ItemDescription,ItemQuantity,ItemRate,ItemAmount,TaxCode\n");
        
        for (Bill bill : bills) {
            String invoiceNo = bill.getInvoiceNumber();
            String customer = escapeCsv(bill.getCustomer().getName());
            String date = bill.getBillDate().toLocalDate().toString();
            
            for (var item : bill.getItems()) {
                String itemName = escapeCsv(item.getProduct().getName());
                String itemDesc = escapeCsv(item.getProduct().getPartNumber());
                int qty = item.getQuantity();
                double rate = item.getPrice();
                double amount = item.getItemTotal();
                String taxCode = item.getGstPercent() > 0 ? "TAX" : "NON";
                
                csv.append(String.format("%s,%s,%s,%s,Net 30,%s,%s,%d,%.2f,%.2f,%s\n",
                        invoiceNo, customer, date, date, itemName, itemDesc, qty, rate, amount, taxCode));
            }
        }
        
        return csv.toString();
    }

    public String exportToTallyXml(LocalDateTime startDate, LocalDateTime endDate) {
        List<Bill> bills = billService.getBillsByDateRange(startDate, endDate);
        StringBuilder xml = new StringBuilder();
        
        xml.append("<ENVELOPE>\n");
        xml.append("  <HEADER>\n");
        xml.append("    <TALLYREQUEST>Import Data</TALLYREQUEST>\n");
        xml.append("  </HEADER>\n");
        xml.append("  <BODY>\n");
        xml.append("    <IMPORTDATA>\n");
        xml.append("      <REQUESTDESC>\n");
        xml.append("        <REPORTNAME>Vouchers</REPORTNAME>\n");
        xml.append("      </REQUESTDESC>\n");
        xml.append("      <REQUESTDATA>\n");
        
        for (Bill bill : bills) {
            xml.append("        <TALLYMESSAGE xmlns:UDF=\"TallyUDF\">\n");
            xml.append("          <VOUCHER VCHTYPE=\"Sales\" ACTION=\"Create\">\n");
            xml.append("            <DATE>").append(bill.getBillDate().toLocalDate().toString().replace("-", "")).append("</DATE>\n");
            xml.append("            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>\n");
            xml.append("            <VOUCHERNUMBER>").append(bill.getInvoiceNumber()).append("</VOUCHERNUMBER>\n");
            xml.append("            <PARTYLEDGERNAME>").append(escapeXml(bill.getCustomer().getName())).append("</PARTYLEDGERNAME>\n");
            
            for (var item : bill.getItems()) {
                xml.append("            <ALLINVENTORYENTRIES.LIST>\n");
                xml.append("              <STOCKITEMNAME>").append(escapeXml(item.getProduct().getName())).append("</STOCKITEMNAME>\n");
                xml.append("              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>\n");
                xml.append("              <RATE>").append(item.getPrice()).append("</RATE>\n");
                xml.append("              <AMOUNT>").append(item.getItemTotal()).append("</AMOUNT>\n");
                xml.append("              <BILLEDQTY>").append(item.getQuantity()).append("</BILLEDQTY>\n");
                xml.append("            </ALLINVENTORYENTRIES.LIST>\n");
            }
            xml.append("          </VOUCHER>\n");
            xml.append("        </TALLYMESSAGE>\n");
        }
        
        xml.append("      </REQUESTDATA>\n");
        xml.append("    </IMPORTDATA>\n");
        xml.append("  </BODY>\n");
        xml.append("</ENVELOPE>\n");
        
        return xml.toString();
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
    
    private String escapeXml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
