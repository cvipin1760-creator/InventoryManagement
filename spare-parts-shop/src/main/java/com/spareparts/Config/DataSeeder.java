package com.spareparts.config;

import com.spareparts.model.BillingType;
import com.spareparts.model.BusinessTemplate;
import com.spareparts.repository.BillingTypeRepository;
import com.spareparts.repository.BusinessTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private BillingTypeRepository billingTypeRepository;

    @Autowired
    private BusinessTemplateRepository businessTemplateRepository;

    @Override
    public void run(String... args) throws Exception {
        seedBillingTypes();
        seedBusinessTemplates();
    }

    private void seedBillingTypes() {
        if (billingTypeRepository.count() == 0) {
            BillingType gstBilling = new BillingType();
            gstBilling.setName("GST Billing");
            gstBilling.setDescription("Standard B2B/B2C GST Billing with HSN/SAC codes");
            gstBilling.setConfigurationJson("{\"fields\": [\"tax\", \"discount\", \"hsn\", \"cgst\", \"sgst\"], \"required\": [\"tax\"]}");
            billingTypeRepository.save(gstBilling);

            BillingType posBilling = new BillingType();
            posBilling.setName("POS Billing");
            posBilling.setDescription("Quick touch-friendly POS billing for Retail/Restaurant");
            posBilling.setConfigurationJson("{\"fields\": [\"discount\", \"barcode\"], \"required\": []}");
            billingTypeRepository.save(posBilling);

            BillingType serviceBilling = new BillingType();
            serviceBilling.setName("Service Billing");
            serviceBilling.setDescription("Billing for repairs with Labour and Job Card");
            serviceBilling.setConfigurationJson("{\"fields\": [\"labour\", \"parts\", \"jobCard\", \"discount\"], \"required\": [\"jobCard\"]}");
            billingTypeRepository.save(serviceBilling);
        }
    }

    private void seedBusinessTemplates() {
        if (businessTemplateRepository.count() == 0) {
            BusinessTemplate mobileShop = new BusinessTemplate();
            mobileShop.setName("Mobile Shop");
            mobileShop.setDescription("Template for Mobile & Electronics stores");
            mobileShop.setBusinessType("Retail");
            mobileShop.setBillingType("GST Billing");
            mobileShop.setModulesJson("[{\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}, {\"key\":\"emi\", \"enabled\":true}, {\"key\":\"warranty\", \"enabled\":true}]");
            mobileShop.setPermissionsJson("[{\"code\":\"invoice.create\", \"enabled\":true}]");
            mobileShop.setDashboardJson("{\"widgets\": [{\"key\":\"sales\", \"enabled\":true}, {\"key\":\"pendingEmi\", \"enabled\":true}, {\"key\":\"warrantyExpiry\", \"enabled\":true}]}");
            businessTemplateRepository.save(mobileShop);

            BusinessTemplate restaurant = new BusinessTemplate();
            restaurant.setName("Restaurant");
            restaurant.setDescription("Template for Cafes and Restaurants");
            restaurant.setBusinessType("F&B");
            restaurant.setBillingType("POS Billing");
            restaurant.setModulesJson("[{\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}, {\"key\":\"kitchenDisplay\", \"enabled\":true}]");
            restaurant.setPermissionsJson("[{\"code\":\"invoice.create\", \"enabled\":true}]");
            restaurant.setDashboardJson("{\"widgets\": [{\"key\":\"sales\", \"enabled\":true}, {\"key\":\"activeTables\", \"enabled\":true}]}");
            businessTemplateRepository.save(restaurant);
        }
    }
}
