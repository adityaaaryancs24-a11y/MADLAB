# MADLAB Report: Verity - Mobile Price Comparison and Barcode Scanning Application

## 1. Abstract

Verity is a mobile application developed for the Mobile Application Development Laboratory to help users compare product prices across multiple retailers using search, barcode scanning, watchlist tracking, and price history analysis. The application is built using React Native with Expo, TypeScript, Expo Router, Firebase Authentication, AsyncStorage-based local persistence, and reusable UI components. The main objective of the project is to reduce the effort required for price comparison by allowing users to scan UPC/EAN barcodes, manually search a product catalog, view retailer-wise prices, and save products for future price monitoring.

The application provides a modern mobile user experience with a home dashboard, barcode scanner, product search screen, product details screen, watchlist, settings, authentication, theme customization, and mock data services. The system stores user-specific data such as scan history, wishlist items, search history, and preferences locally, while Firebase Authentication is used for login and signup. The product catalog includes predefined and procedurally generated products, price comparison entries, price history data, and AI-style price prediction output for demonstration and testing.

The project demonstrates important mobile application development concepts such as component-based architecture, navigation, state management, form validation, camera permission handling, barcode processing, persistent storage, responsive UI design, authentication, and testing. Verity is suitable for academic submission because it combines practical shopping use cases with mobile-specific features such as camera scanning, haptic feedback, safe-area layouts, and cross-platform Expo Go compatibility.

## 2. Introduction

### Project overview

Verity is a smart shopping and price transparency mobile application. The application allows a user to identify products by scanning barcodes or by searching manually, compare prices from multiple retailers, and track products in a personal watchlist. The problem addressed by the system is that users often need to check different stores individually before deciding where to purchase a product. Verity centralizes this comparison workflow in a mobile-first interface.

The application has been implemented using React Native and Expo SDK 54. Expo Router is used for screen routing, React Context is used for centralized state management, Firebase Authentication is used for authentication, and AsyncStorage is used for local persistence of user data. The system includes a product data layer with mock products, barcode lookup functions, generated price data, price history generation, similar product suggestions, best deal calculation, and price prediction logic.

The major screens in the application are the login/signup screen, onboarding screen, home dashboard, barcode scan screen, search screen, product details screen, watchlist screen, and settings screen. Together, these screens form a complete mobile shopping assistant that supports browsing, scanning, saving, comparing, and personalizing the shopping experience.

### User roles

The system mainly supports two logical user roles:

| Sl. No. | Role | Description |
|---|---|---|
| 1 | Guest User | A guest user can open the application, view the onboarding flow, and reach the authentication screen. The guest must sign in or create an account before using the main app experience. |
| 2 | Registered User | A registered user can log in, search products, scan barcodes, view product details, compare retailer prices, add products to the watchlist, manage settings, and log out. |

An admin role is not implemented as a separate in-app interface in the current version. However, admin-level responsibilities are represented conceptually through product data maintenance, retailer price data management, and Firebase project administration.

### User functionalities

The registered user can perform the following functions:

| Sl. No. | Functionality | Description |
|---|---|---|
| 1 | Signup and login | The user can create an account or log in using email and password through Firebase Authentication. |
| 2 | View dashboard | The home screen displays savings summary, scan statistics, price drop alerts, trending products, recommended products, top savings, and recent scans. |
| 3 | Scan barcode | The scan screen uses the device camera to scan UPC/EAN barcodes and search for matching products. |
| 4 | Manual barcode entry | The user can manually enter an 8 to 14 digit barcode if camera scanning is not possible. |
| 5 | Search products | The user can search by product name, brand, model, category, description, or UPC. |
| 6 | Use recent and trending searches | The search screen displays trending terms and stored recent searches for faster access. |
| 7 | Apply category filters | Product search can be refined using category filter chips. |
| 8 | View product details | The product page displays product information, prices, best deal, price history, and prediction data. |
| 9 | Compare retailer prices | The application compares prices from stores such as Amazon India, Flipkart, Reliance Digital, Tata CLIQ, Blinkit, DMart Ready, BigBasket, and Zepto depending on product type. |
| 10 | Add to watchlist | The user can save products to a watchlist for price tracking. |
| 11 | Add manual watchlist product | The watchlist screen allows manual addition of products with current price, previous price, target price, store, UPC, and image URL. |
| 12 | Track savings | The watchlist calculates potential savings and active target price alerts. |
| 13 | Manage settings | The user can configure store preferences, theme, accent color, haptics, notifications, font size, offline mode, and accessibility options. |
| 14 | Logout | The user can securely sign out from the application. |

### Admin functionalities

The current version does not include a dedicated mobile admin dashboard. For academic documentation, the admin responsibilities are defined as backend or project-maintenance activities:

| Sl. No. | Admin Functionality | Description |
|---|---|---|
| 1 | Product catalog management | The admin maintains product records such as product name, brand, UPC, category, image, and description. |
| 2 | Retailer price management | The admin ensures store-wise price records are updated and mapped to the correct products. |
| 3 | Authentication management | The admin manages the Firebase project and monitors registered users through Firebase Console. |
| 4 | Data quality validation | The admin verifies that barcode formats, product identifiers, and price records are valid. |
| 5 | Future analytics review | The admin can review scan trends, popular products, and frequently searched items when a backend analytics layer is added. |

## 3. Hardware and Software Requirements

### Hardware requirements

| Sl. No. | Hardware | Minimum Requirement |
|---|---|---|
| 1 | Development system | Laptop or desktop with Intel i3/Ryzen 3 processor or higher |
| 2 | RAM | Minimum 8 GB recommended |
| 3 | Storage | Minimum 2 GB free space for project files and dependencies |
| 4 | Mobile device | Android or iOS device with camera support |
| 5 | Camera | Required for barcode scanning |
| 6 | Internet connection | Required for installing packages, Firebase login, image loading, and API integration |

### Software requirements

| Sl. No. | Software | Version/Use |
|---|---|---|
| 1 | Operating system | Windows 10/11, macOS, or Linux |
| 2 | Node.js | Node 20 LTS or Node 22 LTS recommended |
| 3 | Expo CLI | Used to run and test the React Native application |
| 4 | React Native | Version 0.81.5 |
| 5 | Expo SDK | Version 54 |
| 6 | TypeScript | Used for type-safe application development |
| 7 | Firebase | Version 12.15.0 for authentication |
| 8 | AsyncStorage | Used for local data persistence |
| 9 | Expo Camera | Used for barcode scanning |
| 10 | Expo Go | Used for mobile testing without native build generation |
| 11 | Visual Studio Code | Recommended code editor |

## 4. Design Layouts / Screenshots section

The following descriptions explain the screenshots that should be included in the report. Each screenshot represents an implemented screen or flow in the Verity application.

| Screenshot | Screen | Description |
|---|---|---|
| Screenshot 1 | Login/Signup Screen | This screen represents the authentication entry point of the application. It allows users to enter email and password credentials, create a new account, or log in to an existing account. The screen connects to Firebase Authentication and displays validation messages for invalid credentials, weak passwords, duplicate emails, and incorrect email formats. |
| Screenshot 2 | Onboarding Screen | This screen introduces the purpose of the application. It explains that Verity helps users compare prices, scan products, and track deals. The onboarding screen prepares first-time users before they enter the main application. |
| Screenshot 3 | Home Dashboard | The dashboard shows the main summary of the user account. It includes the Verity brand header, welcome message, savings summary, total scan count, wishlist count, active alerts, barcode scan shortcut, price drop alerts, trending products, personalized recommendations, top savings today, and recent scans. |
| Screenshot 4 | Barcode Scanner Screen | This screen shows the camera interface used for scanning UPC and EAN barcodes. It includes a scanner overlay, torch control, camera permission handling, haptic feedback support, loading steps, and a manual barcode entry button. |
| Screenshot 5 | Manual Barcode Entry Dialog | This dialog appears when the user chooses manual barcode entry. It accepts numeric UPC/EAN values between 8 and 14 digits and validates empty or invalid input before processing the lookup. |
| Screenshot 6 | Search Home Screen | The search screen in idle state displays the search bar, trending search chips, recent searches, and a helpful empty-state prompt. It allows the user to search by name, brand, model, or barcode. |
| Screenshot 7 | Search Results Screen | This screenshot shows the result list after a user searches for a term such as "watch" or "headphones". Each product card displays image, brand, title, category, price, and action controls in a compact card layout. Category filters and result count are visible above the list. |
| Screenshot 8 | Product Details Screen | This screen displays detailed product information, retailer-wise price comparison, best price indication, price history chart, watchlist action, and AI-style price prediction. It helps the user decide whether to buy immediately or wait. |
| Screenshot 9 | Watchlist Screen | The watchlist screen shows saved products, total savings, active alerts, filters, and manually added products. It allows the user to track product prices and target prices over time. |
| Screenshot 10 | Add Product Form | This form is part of the watchlist screen. It allows a user to enter product name, brand, current price, previous price, target price, UPC, store, and image URL. Validation prevents missing product names and invalid prices. |
| Screenshot 11 | Settings Screen | The settings screen allows the user to manage account preferences, store preferences, notification settings, theme mode, accent color, scan sound, haptic feedback, price alerts, font size, accessibility, and logout. |

## 5. Database Table Screenshots

### Database description

The current Verity application uses a hybrid data model. Firebase Authentication is used for account identity, while user-specific application data is stored locally through AsyncStorage. Product information is represented through TypeScript interfaces and mock data services. The mock product database includes product records, generated prices, price history, predictions, search history, scan history, watchlist items, and user settings.

In a production implementation, the same model can be migrated to Firestore or another cloud database. The logical database contains the following major entities:

| Table/Entity | Purpose |
|---|---|
| Users | Stores authenticated user profile details such as user ID, name, email, avatar, and membership tier. |
| Products | Stores product catalog information such as product ID, UPC, name, brand, model, image, category, description, rating, review count, and stock status. |
| PriceInfo | Stores retailer-wise price data for each product, including store name, logo, price, stock, URL, and best-price flag. |
| PriceHistory | Stores historical price points with timestamp, price, and store. |
| ScanHistory | Stores products scanned by the user, including product ID, name, image, best price, store, timestamp, and UPC. |
| Watchlist | Stores user-saved products, current price, previous price, price drop percentage, target price, price history, added date, and URL. |
| SearchHistory | Stores recent searches with query, timestamp, and result count. |
| UserSettings | Stores user preferences such as preferred stores, currency, notifications, haptics, theme mode, accent color, font size, and accessibility options. |

### ER Diagram explanation

The ER diagram for the Verity system consists of the entities User, Product, PriceInfo, PriceHistory, ScanHistory, Watchlist, SearchHistory, and UserSettings. A User can have many ScanHistory records, many Watchlist records, many SearchHistory records, and one UserSettings record. A Product can have many PriceInfo records and many PriceHistory records. Watchlist records reference products and include additional user-specific fields such as target price and added date. ScanHistory records also reference products and record when the product was scanned. SearchHistory records belong to the user and store query-level activity.

The relationship between User and Product is indirect through ScanHistory and Watchlist. This design avoids duplicating the product catalog for each user. Product information remains centralized, while user-specific activity is stored separately. PriceInfo and PriceHistory are connected to Product because price data is product-specific and can be displayed for all users. UserSettings is connected one-to-one with User because each user has a personal preference configuration.

### Schema Diagram explanation

The schema diagram represents the logical structure of the app data. The Users collection contains user identity fields. The Products collection contains static product metadata. The Prices collection stores retailer-wise price rows and uses productId as a foreign key. The PriceHistory collection stores time-series price points and also references productId. The ScanHistory collection stores userId and productId, allowing retrieval of recent scans for a specific user. The Watchlist collection stores userId, productId, currentPrice, previousPrice, targetPrice, and priceHistory fields. The SearchHistory collection stores userId, query, timestamp, and result count. The UserSettings collection stores userId and a nested settings object.

In the implemented React Native version, these schema objects are represented through TypeScript interfaces and stored in AsyncStorage keys such as `verity_history`, `verity_watchlist`, `verity_settings`, and `verity_search_history`. Firebase provides the authenticated user identity, while local storage provides persistence for mobile app state.

## 6. Testing

### Testing methodology

The testing approach used for Verity includes functional testing, UI testing, input validation testing, integration testing, edge-case testing, and security testing. Functional testing verifies whether each feature works according to the requirement. UI testing verifies that screens render correctly on mobile devices and that layout elements are responsive. Input validation testing verifies that barcode, login, signup, and manual product forms reject invalid data. Integration testing checks whether navigation, Firebase Authentication, AsyncStorage, scanner flow, and product lookup services work together. Edge-case testing verifies behavior for empty states, invalid barcodes, missing camera permission, empty watchlist, and no search results. Security testing verifies that authentication failures are handled safely and that user actions do not expose sensitive data.

The project was also verified using TypeScript compilation and Expo linting. TypeScript validation ensures that interfaces, component props, and data structures are consistent. Linting helps detect unused imports, dependency warnings, and code quality issues. Expo Go testing verifies that the application can start and run on a mobile device without crashing during initialization.

### Unit test cases in tabular format

| Test ID | Module | Test Scenario | Input | Expected Output | Result |
|---|---|---|---|---|---|
| TC-01 | Authentication | Login with valid credentials | Registered email and password | User is authenticated and redirected to main app | Pass |
| TC-02 | Authentication | Login with invalid credentials | Wrong email/password | Error message is displayed and login is denied | Pass |
| TC-03 | Authentication | Signup with weak password | Password below required length | Weak password validation message is shown | Pass |
| TC-04 | Firebase Config | Initialize app on startup | App launch | Firebase app and Auth instance initialize without runtime crash | Pass |
| TC-05 | Home Dashboard | Display dashboard statistics | Existing scan/watchlist data | Total scans, wishlist count, active alerts, and savings are displayed | Pass |
| TC-06 | Barcode Scanner | Camera permission not granted | First app camera access | Permission request screen is displayed | Pass |
| TC-07 | Barcode Scanner | Scan valid barcode | Valid UPC/EAN code | Product lookup is started and scan history is updated | Pass |
| TC-08 | Manual Barcode | Submit empty barcode | Empty input | "Please enter a barcode number" error is shown | Pass |
| TC-09 | Manual Barcode | Submit invalid barcode length | 5-digit or 20-digit value | "Enter an 8 to 14 digit UPC or EAN code" error is shown | Pass |
| TC-10 | Search | Search valid term | "watch" | Matching product results are displayed | Pass |
| TC-11 | Search | Search with no matching result | Random invalid text | No results screen is displayed | Pass |
| TC-12 | Search History | Select recent search | Existing recent query | Search is re-run using selected query | Pass |
| TC-13 | Category Filter | Filter search by category | Active category chip | Results are filtered by selected category | Pass |
| TC-14 | Product Card | Open product from results | Tap product card | Product detail route opens for selected UPC | Pass |
| TC-15 | Product Details | Display prices | Product with prices | Retailer-wise prices and best price are shown | Pass |
| TC-16 | Price History | Generate price history | Product ID and 30 days | Price history points are generated and displayed | Pass |
| TC-17 | Watchlist | Add product to watchlist | Product details action | Product is saved to watchlist | Pass |
| TC-18 | Watchlist Manual Form | Add valid manual product | Name and valid price fields | Manual product is added and toast message is shown | Pass |
| TC-19 | Watchlist Manual Form | Submit missing product name | Empty name | Alert message asks user to enter product name | Pass |
| TC-20 | Watchlist Manual Form | Submit invalid price | Non-numeric or zero price | Alert message rejects invalid price | Pass |
| TC-21 | Settings | Change theme mode | Light/dark theme option | App theme updates through context and theme signal | Pass |
| TC-22 | Settings | Toggle haptic feedback | On/off switch | Scanner respects haptic feedback setting | Pass |
| TC-23 | Persistence | Restart app after saving data | Existing AsyncStorage data | History, watchlist, settings, and search history are restored | Pass |
| TC-24 | Logout | User signs out | Logout action | Firebase signs out and local auth state resets | Pass |

### Edge cases, security tests, and validation tests

| Category | Test Case | Expected Behaviour |
|---|---|---|
| Edge Case | Search query contains only spaces | Search should not run and idle state should remain visible. |
| Edge Case | Product image URL fails to load | UI should remain usable and not crash. |
| Edge Case | Watchlist is empty | Empty state and manual add option should be displayed. |
| Edge Case | Scan history is empty | Dashboard should hide recent scans or display default content safely. |
| Edge Case | Retailer price is null | Null price should be treated as manual/local input and excluded from best-price calculation. |
| Edge Case | Camera permission denied | App should show permission request information instead of crashing. |
| Edge Case | Multiple barcode scans happen quickly | Scan lock should prevent duplicate processing for a short interval. |
| Validation | Manual barcode contains letters | Non-numeric characters should be removed before validation. |
| Validation | Manual product current price is zero | Product should not be saved and validation alert should appear. |
| Validation | Target price is negative | Product should not be saved and target price validation should appear. |
| Validation | Email format is invalid | Firebase validation should reject the login or signup attempt. |
| Security | Invalid Firebase credentials | Application should show a safe error message and should not authenticate the user. |
| Security | Logout action | Auth state should be cleared and user should not remain authenticated. |
| Security | Firebase initialization | Auth should initialize through supported SDK APIs and should not crash during module load. |
| Security | Local stored data | User-specific data should remain within app storage keys and should be cleared where account deletion logic is used. |

## 7. Conclusion

The Verity mobile application successfully demonstrates a complete mobile price comparison system using React Native, Expo, TypeScript, Firebase Authentication, camera-based barcode scanning, local persistence, and reusable UI components. The application provides a practical solution for users who want to compare product prices quickly, track savings, maintain a watchlist, and make better purchase decisions.

The project satisfies the main objectives of a Mobile Application Development laboratory submission by including mobile navigation, authentication, camera access, form validation, local storage, dynamic UI states, product search, data modeling, and testing. The system is modular and extendable, making it suitable for future integration with real retailer APIs, cloud databases, and production analytics. Overall, Verity is a functional, user-friendly, and academically relevant mobile application.

## 8. Future Work

The following enhancements can be added in future versions:

| Sl. No. | Enhancement | Description |
|---|---|---|
| 1 | Real retailer API integration | Connect the app to live price APIs from e-commerce and grocery platforms. |
| 2 | Cloud database | Move product, watchlist, scan history, and settings data to Firebase Firestore. |
| 3 | Push notifications | Notify users when a watched product drops below the target price. |
| 4 | Admin dashboard | Add a web or mobile dashboard for product and retailer price management. |
| 5 | OCR bill scanning | Allow users to scan receipts and compare purchased prices with online prices. |
| 6 | Price prediction model | Replace mock prediction logic with a trained machine learning model. |
| 7 | Multi-language support | Add support for Indian regional languages. |
| 8 | Store locator | Show nearby stores with available stock and price. |
| 9 | Coupon integration | Display coupon codes and bank offers along with product prices. |
| 10 | Cloud sync | Sync user preferences, search history, and watchlist across devices. |
| 11 | Accessibility improvements | Add screen reader labels, high contrast refinements, and larger touch targets. |
| 12 | Automated tests | Add Jest unit tests and end-to-end tests for critical user flows. |

## 9. References

1. React Native Documentation, "React Native - Learn once, write anywhere", https://reactnative.dev/
2. Expo Documentation, "Expo and Expo Router Guides", https://docs.expo.dev/
3. Firebase Documentation, "Firebase Authentication for JavaScript", https://firebase.google.com/docs/auth
4. React Navigation Documentation, "Navigation for React Native apps", https://reactnavigation.org/
5. TypeScript Documentation, "Typed JavaScript at Any Scale", https://www.typescriptlang.org/docs/
6. AsyncStorage Documentation, "React Native Async Storage", https://react-native-async-storage.github.io/async-storage/
7. Expo Camera Documentation, "Camera and barcode scanning APIs", https://docs.expo.dev/versions/latest/sdk/camera/
8. Lucide Icons Documentation, "Lucide React Native Icons", https://lucide.dev/
9. VTU Mobile Application Development Laboratory syllabus and academic report guidelines.

## 10. Appendix

### Appendix A: Main project structure

| Path | Description |
|---|---|
| `MADLAB/mobile-app/app` | Contains Expo Router screens and route layouts. |
| `MADLAB/mobile-app/app/(tabs)` | Contains main tab screens: home, search, scan, watchlist, and settings. |
| `MADLAB/mobile-app/app/product/[upc].tsx` | Dynamic product detail screen opened using UPC route parameter. |
| `MADLAB/mobile-app/components/search` | Contains reusable search UI components such as SearchBar, ProductCard, CategoryFilters, RecentSearches, and TrendingSearches. |
| `MADLAB/mobile-app/components/scanner` | Contains scanner overlay and loading step components. |
| `MADLAB/mobile-app/src/context/AppContext.tsx` | Centralized state management for user, history, watchlist, settings, search history, and authentication actions. |
| `MADLAB/mobile-app/src/config/firebase.ts` | Firebase app and authentication configuration. |
| `MADLAB/mobile-app/src/types/index.ts` | TypeScript interfaces for Product, PriceInfo, WatchlistItem, ScanHistoryItem, UserSettings, User, and related models. |
| `MADLAB/mobile-app/src/utils/mockData.ts` | Mock product database, search functions, price generation, price history, best deals, predictions, and sample watchlist data. |
| `MADLAB/mobile-app/hooks` | Custom hooks for barcode lookup, search, and theme behavior. |
| `MADLAB/mobile-app/services` | Service layer for backend/product API interaction. |

### Appendix B: Important data models

| Model | Key Fields |
|---|---|
| Product | id, name, brand, model, upc, image, category, description, rating, reviewsCount, stockStatus, prices, priceHistory |
| PriceInfo | store, logo, price, stock, url, isBest, isInput, lastUpdated |
| ScanHistoryItem | id, productId, name, image, bestPrice, store, timestamp, upc |
| WatchlistItem | id, productId, name, brand, image, currentPrice, previousPrice, priceDropPercent, targetPrice, priceHistory, addedAt, url |
| UserSettings | preferredStores, currency, scanSound, hapticFeedback, priceAlerts, themeMode, accentColor, notifications, fontSize, offlineMode, highContrast |
| SearchHistoryItem | id, query, timestamp, resultsCount |
| PricePrediction | productId, currentPrice, predictedPrice, confidence, trend, daysAhead, factors, dealScore, recommendation |

### Appendix C: Commands used for development and testing

| Command | Purpose |
|---|---|
| `npm install` | Installs project dependencies. |
| `npx expo start` | Starts Expo development server. |
| `npx expo start --offline --clear` | Starts Expo in offline mode and clears Metro cache. |
| `npm run lint` | Runs Expo linting. |
| `npx tsc --noEmit` | Runs TypeScript type checking without generating output files. |

### Appendix D: Authentication initialization note

The Firebase configuration uses `getAuth(app)` from `firebase/auth` for Expo Go compatibility. The earlier React Native persistence helper path caused a runtime issue because `getReactNativePersistence` was not available from the installed Firebase wrapper entry point. The corrected initialization prevents a white screen on startup and allows the application to load without an authentication module crash.

### Appendix E: Sample barcode values for testing

| Product | Barcode/UPC |
|---|---|
| Sony WH-1000XM5 Wireless Headphones | 027242920425 |
| Apple Watch Series 9 | 194253407744 |
| Keurig K-Elite Coffee Maker | 611247373835 |
| Nintendo Switch OLED | 045496883089 |
| Dyson V15 Detect | 885609021843 |
| Tata Salt Iodized 1kg | 8901052002244 |
| Surf Excel Easy Wash Detergent Powder 1kg | 8901030875707 |

