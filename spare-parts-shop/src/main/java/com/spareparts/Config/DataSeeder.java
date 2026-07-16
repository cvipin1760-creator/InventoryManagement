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

    @Autowired
    private com.spareparts.repository.ModuleDefinitionRepository moduleDefinitionRepository;

    @Autowired
    private com.spareparts.repository.SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) throws Exception {
        seedBillingTypes();
        seedBusinessTemplates();
        seedSubscriptionPlans();
        seedEnterpriseModules();
    }

    private void seedBillingTypes() {
        if (billingTypeRepository.findAll().stream().noneMatch(b -> b.getName().equals("GST Billing"))) {
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

        }

        if (billingTypeRepository.findAll().stream().noneMatch(b -> b.getName().equals("Service Billing"))) {
            BillingType serviceBilling = new BillingType();
            serviceBilling.setName("Service Billing");
            serviceBilling.setDescription("Billing for repairs with Labour and Job Card");
            serviceBilling.setConfigurationJson("{\"fields\": [\"labour\", \"parts\", \"jobCard\", \"discount\"], \"required\": [\"jobCard\"]}");
            billingTypeRepository.save(serviceBilling);
        }

        if (billingTypeRepository.findAll().stream().noneMatch(b -> b.getName().equals("Quick POS"))) {
            BillingType quickPos = new BillingType();
            quickPos.setName("Quick POS");
            quickPos.setDescription("Optimized high-speed POS for Retail with barcode support");
            quickPos.setConfigurationJson("{\"fields\": [\"discount\", \"barcode\", \"loyalty\", \"heldBills\"], \"required\": []}");
            billingTypeRepository.save(quickPos);
        }
    }

    private void seedBusinessTemplates() {
        if (businessTemplateRepository.findAll().stream().noneMatch(b -> b.getName().equals("Mobile Shop"))) {
            BusinessTemplate mobileShop = new BusinessTemplate();
            mobileShop.setName("Mobile Shop");
            mobileShop.setDescription("Template for Mobile & Electronics stores");
            mobileShop.setBusinessType("Retail");
            mobileShop.setBillingType("GST Billing");
            mobileShop.setModulesJson("[{\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}, {\"key\":\"emi\", \"enabled\":true}, {\"key\":\"warranty\", \"enabled\":true}]");
            mobileShop.setPermissionsJson("[{\"code\":\"invoice.create\", \"enabled\":true}]");
            mobileShop.setDashboardJson("{\"widgets\": [{\"key\":\"sales\", \"enabled\":true}, {\"key\":\"pendingEmi\", \"enabled\":true}, {\"key\":\"warrantyExpiry\", \"enabled\":true}]}");
            businessTemplateRepository.save(mobileShop);
        }

        if (businessTemplateRepository.findAll().stream().noneMatch(b -> b.getName().equals("Restaurant"))) {
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

        if (businessTemplateRepository.findAll().stream().noneMatch(b -> b.getName().equals("Retail & Inventory Store (Quick POS)"))) {
            BusinessTemplate quickPosTemplate = new BusinessTemplate();
            quickPosTemplate.setName("Retail & Inventory Store (Quick POS)");
            quickPosTemplate.setDescription("Optimized for businesses having thousands of products where invoices must be generated in seconds.");
            quickPosTemplate.setBusinessType("Retail");
            quickPosTemplate.setBillingType("Quick POS");
            quickPosTemplate.setModulesJson("[{\"key\":\"dashboard\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}, {\"key\":\"products\", \"enabled\":true}, {\"key\":\"categories\", \"enabled\":true}, {\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"customers\", \"enabled\":true}, {\"key\":\"suppliers\", \"enabled\":true}, {\"key\":\"purchase\", \"enabled\":true}, {\"key\":\"purchaseOrders\", \"enabled\":true}, {\"key\":\"returns\", \"enabled\":true}, {\"key\":\"expenses\", \"enabled\":true}, {\"key\":\"reports\", \"enabled\":true}, {\"key\":\"analytics\", \"enabled\":true}, {\"key\":\"barcode\", \"enabled\":true}, {\"key\":\"qrCode\", \"enabled\":true}, {\"key\":\"emi\", \"enabled\":true}, {\"key\":\"warranty\", \"enabled\":true}, {\"key\":\"customerPortal\", \"enabled\":true}, {\"key\":\"employeeManagement\", \"enabled\":true}, {\"key\":\"stockTransfer\", \"enabled\":true}, {\"key\":\"multiBranch\", \"enabled\":true}]");
            quickPosTemplate.setPermissionsJson("[{\"code\":\"invoice.create\", \"enabled\":true}]");
            quickPosTemplate.setDashboardJson("{\"widgets\": [{\"key\":\"sales\", \"enabled\":true}, {\"key\":\"pendingEmi\", \"enabled\":true}, {\"key\":\"lowStock\", \"enabled\":true}, {\"key\":\"topProducts\", \"enabled\":true}]}");
            businessTemplateRepository.save(quickPosTemplate);
        }
    }
}
