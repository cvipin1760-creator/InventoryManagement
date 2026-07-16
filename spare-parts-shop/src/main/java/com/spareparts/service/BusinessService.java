package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BusinessService {

    @Autowired
    private BusinessRepository businessRepository;

    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }

    public Business getBusinessById(Long id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found"));
    }

    public Business createBusiness(Business business) {
        if (business.getSubscriptionStartDate() == null) {
            business.setSubscriptionStartDate(LocalDateTime.now());
        }
        if (business.getSubscriptionPlan().equals("TRIAL")) {
            // 7-day trial
            business.setSubscriptionEndDate(LocalDateTime.now().plusDays(7));
        } else if (business.getSubscriptionPlan().equals("MONTHLY")) {
            business.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
        } else if (business.getSubscriptionPlan().equals("YEARLY")) {
            business.setSubscriptionEndDate(LocalDateTime.now().plusYears(1));
        }
        return businessRepository.save(business);
    }

    public Business updateBusiness(Long id, Business businessDetails) {
        Business business = getBusinessById(id);
        business.setBusinessName(businessDetails.getBusinessName());
        business.setGstNumber(businessDetails.getGstNumber());
        business.setAddress(businessDetails.getAddress());
        business.setContactNumber(businessDetails.getContactNumber());
        business.setEmail(businessDetails.getEmail());
        business.setBusinessType(businessDetails.getBusinessType());
        business.setCity(businessDetails.getCity());
        business.setState(businessDetails.getState());
        business.setPincode(businessDetails.getPincode());
        business.setWebsite(businessDetails.getWebsite());
        business.setUpiId(businessDetails.getUpiId());
        business.setBankAccountInfo(businessDetails.getBankAccountInfo());
        business.setTermsAndConditions(businessDetails.getTermsAndConditions());
        business.setSignatureText(businessDetails.getSignatureText());
        return businessRepository.save(business);
    }

    public Business updateSubscription(Long id, String subscriptionPlan) {
        Business business = getBusinessById(id);
        business.setSubscriptionPlan(subscriptionPlan);
        business.setSubscriptionStartDate(LocalDateTime.now());
        if (subscriptionPlan.equals("TRIAL")) {
            business.setSubscriptionEndDate(LocalDateTime.now().plusDays(7));
        } else if (subscriptionPlan.equals("MONTHLY")) {
            business.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
        } else if (subscriptionPlan.equals("YEARLY")) {
            business.setSubscriptionEndDate(LocalDateTime.now().plusYears(1));
        }
        business.setIsSubscriptionActive(true);
        return businessRepository.save(business);
    }

    public Business toggleSubscriptionStatus(Long id, Boolean isActive) {
        Business business = getBusinessById(id);
        business.setIsSubscriptionActive(isActive);
        return businessRepository.save(business);
    }

    public void deleteBusiness(Long id) {
        businessRepository.deleteById(id);
    }
}
