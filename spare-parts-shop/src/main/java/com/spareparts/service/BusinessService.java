package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return businessRepository.save(business);
    }

    public void deleteBusiness(Long id) {
        businessRepository.deleteById(id);
    }
}
