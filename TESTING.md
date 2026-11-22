# Testing Documentation

## 1. Testing Overview

The Visitor Photo Slideshow application is tested manually to verify that its main features work as expected.

The testing process focuses on:

- Visitor registration and login.
- Administrator login.
- Photo uploading and management.
- Photo visibility and consent.
- Community Photo Gallery.
- Shared Slideshow.
- Administrator photo moderation.
- Frontend and backend communication.

**Testing approach:** Manual functional testing.

**Testing environment:** Local development environment using React, Node.js, Express, MongoDB and Cloudinary.

### Test Status

- **Passed:** The test was performed successfully.
- **Failed:** The test was performed but did not produce the expected result.
- **Not Tested:** The test has not been verified.

## 2. Visitor Registration and Login Testing

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Register with valid visitor details | Visitor account should be created successfully. | Visitor account was created successfully. | Passed |
| TC-02 | Register using an already registered email | Registration should be rejected with an appropriate error. | Not tested. | Not Tested |
| TC-03 | Register with missing details | Validation error should be displayed. | Not tested. | Not Tested |
| TC-04 | Register using a PIN containing non-numeric characters | Registration should be rejected. | Not tested. | Not Tested |
| TC-05 | Login using correct Visitor ID and PIN | Visitor should log in successfully. | Visitor successfully accessed the dashboard. | Passed |
| TC-06 | Login using an incorrect PIN | Login should be rejected. | Application displayed "Invalid Visitor ID or PIN." | Passed |
| TC-07 | Login using an invalid Visitor ID | An appropriate error should be displayed. | Not tested separately. | Not Tested |

## 3. Photo Upload and Management Testing

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-08 | Upload valid JPG or PNG photographs | Photographs should upload successfully. | Photograph uploaded successfully. | Passed |
| TC-09 | Upload more than 7 photographs in one request | Upload should be rejected. | Application displayed "You can upload a maximum of 7 photos at a time." | Passed |
| TC-10 | Upload a file larger than 20 MB | Upload should be rejected with an appropriate error. | Not tested because a suitable large image was unavailable. | Not Tested |
| TC-11 | Upload an unsupported file format | Upload should be rejected. | Application rejected the unsupported file. | Passed |
| TC-12 | View uploaded photographs in the personal gallery | The visitor should see their own photographs. | Uploaded photographs appeared in the personal gallery. | Passed |
| TC-13 | Open a photograph | The selected photograph should open correctly. | Selected photograph opened correctly. | Passed |
| TC-14 | Download an uploaded photograph | The photograph should download successfully. | Photograph downloaded successfully. | Passed |
| TC-15 | Delete an uploaded photograph | The photograph should be removed from the visitor's gallery and database. | Delete functionality worked successfully. | Passed |
| TC-16 | Hide and unhide a photograph | Its hidden status should update successfully. | Hide and unhide functionality worked successfully. | Passed |

## 4. Public Gallery and Shared Slideshow Testing

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-17 | Make a private photograph public without consent | The request should be rejected. | Not independently verified. | Not Tested |
| TC-18 | Make a photograph public with consent | The photograph should enter pending moderation. | Photograph entered pending moderation. | Passed |
| TC-19 | View a photograph that has not been approved | It should not appear in the public gallery. | Not tested separately. | Not Tested |
| TC-20 | View an approved public photograph | It should appear in the Community Photo Gallery. | Approved photograph appeared in the Community Photo Gallery. | Passed |
| TC-21 | View a hidden photograph in the public gallery | The photograph should not be displayed. | Not tested separately. | Not Tested |
| TC-22 | Open the Shared Slideshow | Approved public photographs should be displayed. | Approved public photographs appeared in the Shared Slideshow. | Passed |
| TC-23 | Check automatic slideshow progression | The displayed photograph should change automatically. | Photograph changed automatically. | Passed |
| TC-24 | Use Previous and Next controls | The slideshow should navigate between photographs. | Previous and Next controls worked correctly. | Passed |
| TC-25 | Pause and resume the slideshow | Automatic progression should stop and resume accordingly. | Pause and resume controls worked correctly. | Passed |

## 5. Administrator Testing

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-26 | Create the first administrator using a valid setup secret | Administrator account should be created successfully. | Not tested during this session. | Not Tested |
| TC-27 | Attempt administrator setup with an incorrect setup secret | Setup should be rejected. | Not tested. | Not Tested |
| TC-28 | Log in using valid administrator credentials | Administrator should access the dashboard. | Administrator successfully accessed the dashboard. | Passed |
| TC-29 | Log in using incorrect administrator credentials | Login should be rejected. | Not tested. | Not Tested |
| TC-30 | View dashboard statistics | Correct photo statistics should be displayed. | Dashboard statistics were displayed and matched the photo records. | Passed |
| TC-31 | View pending photographs | Pending public photographs should be displayed. | Administrator could view pending photographs. | Passed |
| TC-32 | Approve a pending photograph | Its moderation status should change to approved. | Photograph was approved and appeared in public galleries. | Passed |
| TC-33 | Reject a pending photograph | Its moderation status should change to rejected. | Photograph was rejected and disappeared from public galleries. | Passed |
| TC-34 | Revoke approval of an approved photograph | Its moderation status should change to approval_revoked. | Approval was revoked and the photograph disappeared from public galleries. | Passed |

## 6. System Integration and Error Handling

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-35 | Open the backend root URL | Backend running message should be displayed. | Backend running message was displayed successfully. | Passed |
| TC-36 | Access the `/api/test` endpoint | A successful API response should be returned. | Successful JSON response was received. | Passed |
| TC-37 | Access a protected visitor route without a valid token | Access should be denied. | Not tested. | Not Tested |
| TC-38 | Access a protected administrator route without an admin token | Access should be denied. | Not tested. | Not Tested |
| TC-39 | Try to access another visitor's photograph | Access should be denied. | Not directly tested. | Not Tested |
| TC-40 | Check frontend communication with the backend | API requests should work correctly. | Frontend successfully communicated with the backend and loaded the personal gallery. | Passed |
| TC-41 | Start the backend when MongoDB is unavailable | The connection failure should be reported in the backend console. | Not tested. | Not Tested |

## 7. Testing Summary

The Visitor Photo Slideshow application was tested manually in a local development environment.

Testing covered visitor registration and login, photo uploading and management, public photo sharing, slideshow functionality, administrator moderation and frontend-backend communication.

The tested application features performed as expected. Some test cases remain unverified and are identified as Not Tested.

Further testing can be performed to verify the remaining cases and improve overall application reliability.