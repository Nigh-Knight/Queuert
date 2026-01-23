# PRD: Queuert - the queue master

## 1. Product overview
### 1.1 Document title and version
   - PRD: Queuert - the queue master
   - Version: 1.0
   
### 1.2 Product summary
   The Queuert app is designed to streamline the queue and timer management for Laundry Love events, offering a digital solution to replace traditional paper-based systems. It serves as a glorified queue system with integrated timers, enabling both service users and service providers to efficiently interact with the laundry service.

   Service users can view their place in the queue and monitor a timer indicating when their laundry cycle is expected to be complete. Service providers, primarily volunteers, gain robust capabilities to manage the queue, including adding individuals (especially those without smartphones), removing them, starting and monitoring wash timers, and marking cycles as complete. The goal is to enhance the overall experience for all participants by improving efficiency and communication at Laundry Love events.

## 2. Goals
### 2.1 Business goals
   - Reduce reliance on paper-based queue management for Laundry Love.
   - Improve efficiency of managing client flow at Laundry Love events.
   - Enhance the overall experience for Laundry Love volunteers.
   - Streamline data collection for service users, including home situation (homeless/sheltered) and amount of laundry.
### 2.2 User goals
   - Service Users: Easily view their place in the laundry queue.
   - Service Users: Know when their laundry cycle is expected to be complete.
   - Service Users: Receive notifications when their wash cycle is done.
   - Service Users: Provide necessary intake information (e.g., home situation, laundry amount) efficiently.
   - Service Providers (Volunteers): Effectively manage the client queue (add, remove, update status).
   - Service Providers (Volunteers): Receive timely notifications when a washer cycle is complete.
   - Service Providers (Volunteers): Easily move clients through the queue.
   - Service Providers (Volunteers): Efficiently collect required client intake data.
### 2.3 Non-goals
   - Payment processing: The app will not handle any financial transactions or integrate with payment systems.
   - Machine integration: The app will not directly control or integrate with the physical laundry machines (e.g., starting them automatically).
   - Full CRM (Customer Relationship Management) system: While it collects some client data, the app's primary purpose is queue management, not comprehensive client relationship tracking beyond what's needed for the laundry service.
   - Appointment scheduling: The app will not allow users to book specific time slots in advance for laundry services.
   - Inventory management: The app will not track supplies like detergent, fabric softener, etc.
   - Complex reporting/analytics: Reporting will be basic, focused on queue metrics, rather than advanced data analysis.
## 3. User personas
### 3.1 Key user types
   - Service Users
   - Service Providers
### 3.2 Basic persona details
   - **Service Users**: Mostly individuals who are homeless, sheltered, or lack a home laundry machine. They possess phones and dirty clothes, needing timely laundry service. They often arrive in large groups, requiring efficient processing.
   - **Service Providers**: Volunteers who typically know each other and coordinate well. They are motivated to assist service users efficiently.
### 3.3 Role-based access
- **Service User**: Can view their current position in the queue, receive notifications upon wash cycle completion, scan a QR code to initiate their entry, provide their phone number, fill out a personal information form (including living situation), and obtain a queue position. They will receive an alert to 'remove clothes' when their wash is complete. They can also alert a volunteer if a washer breaks down or they need to leave the queue, leading to their removal.
- **Service Provider**: Can view all individuals in the queue, including their positions and details. They can add people to the queue if a user doesn't have a phone. They can remove someone from the queue (triggered by timer completion or early clothes removal). They can search through the queue. They can start a washer timer for a user (as they hold the physical laundry card), see which washers are active, mark a wash as done early, and monitor the remaining time on a washer. Each Service Provider has their own QR code to track who facilitated which user's entry. They are identified as 'volunteers' at entry. When a timer finishes, an alert will highlight the completed user ('red card' focus) allowing the volunteer to remove them.
## 4. Functional requirements
   - **User Role Differentiation** (Priority: High)
     - The app can distinguish between Service Providers and Service Users at login/entry.
   - **Service User Onboarding** (Priority: High)
     - Service Users can scan a QR code provided by a Service Provider to initiate entry.
     - Service Users can sign up/identify themselves using their phone number.
     - Service Users can complete a form requesting personal information (e.g., living situation, amount of laundry).
   - **Queue Management - Service User View** (Priority: High)
     - Service Users can view their current position in the queue.
     - Service Users can view a timer indicating when their current wash cycle is expected to be complete.
   - **Queue Management - Service Provider View** (Priority: High)
     - Service Providers can view the entire queue, including all individuals and their current status (whose washing and whose waiting).
     - Service Providers can see the queue number for each person.
     - Service Providers can see the timer status for each active wash cycle (time left).
     - Service Providers can remove a user from the queue (triggered by timer completion, early clothes removal, or user request due to issues/leaving).
     - Service Providers can mark a user's wash cycle as completed early.
     - Service Providers can add a user to the queue (for those without phones).
     - Service Providers can search for users within the queue.
   - **Timer Functionality** (Priority: High)
     - Service Providers can start a timer for a specific user's wash cycle (default 23 minutes).
   - **Notifications** (Priority: High)
     - The app sends push notifications to Service Providers when a wash cycle completes, highlighting the completed user on the queue screen with a 'red card' focus.
     - The app can send text message (SMS) notifications to Service Users (who provide a phone number) when their wash cycle completes, with an alert to 'remove clothes'.
   - **QR Code Generation** (Priority: Medium)
     - The app can generate unique QR codes for each Service Provider (to identify who initiated a user's entry).
   - **Multi-language Support** (Priority: High)
     - The app supports Spanish, Portuguese, and Haitian Creole for the user interface.
   - **Data Storage** (Priority: High)
     - The app integrates with Google Sheets to store collected data (user intake forms, queue history, timer events).
   - **Location Selection** (Priority: High)
     - Users (both Service Users and Service Providers) can select which Laundry Love location they are using (Kam's Laundromat or Star Laundry Love).
## 5. User experience
### 5.1. Entry points & first-time user flow
   - Users download the app from their respective app stores.
   - Upon first launch, a screen prompts the user to select their role: 'Volunteer' (Service Provider) or 'Guest' (Service User).
   - Users then select the specific Laundry Love location they are at (Kam's Laundromat or Star Laundry Love).
   - For the first Service Provider (e.g., the event organizer), a flow is initiated to connect the app to a Google Sheet for data storage.
### 5.2. Core experience
   - The app's core experience revolves around managing the queue and wash timers during a Laundry Love event. Service Users interact by checking their queue position and wash status, while Service Providers actively manage the queue, start/stop timers, and handle user requests.
### 5.3. Advanced features & edge cases
   - **Washer Breakdown/Early Departure**: If a washer breaks down or a Service User needs to leave early, they can inform a Service Provider. The Service Provider can then search for and remove the user from the queue.
   - **Users Without Phones**: Service Providers can manually add Service Users to the queue if the user does not have a smartphone to scan a QR code.
   - **Multi-location Support**: The app facilitates selection between 'Kam's Laundromat' and 'Star Laundry Love' at the initial setup, allowing users to interact with the correct queue and data for their chosen location.
   - **Queue Search**: Service Providers can search through the queue to quickly find specific individuals.
### 5.4. UI/UX highlights
   - **Neo-Brutalist Aesthetic**:
   - High Contrast & Bold Typography: Use strong, clear fonts and high-contrast color schemes for maximum readability, especially for queue numbers, timers, and alerts.
   - Prominent CTAs: Buttons for 'Start Timer,' 'Mark Done,' 'Remove Clothes,' 'Scan QR' etc., should be large, distinct, and immediately recognizable, perhaps with stark outlines and solid colors.
   - Deliberate Use of Space: A clean layout with ample whitespace around key information (queue items, timers) to prevent visual clutter and improve focus.
   - Minimalist Iconography: Simple, clear icons that convey meaning without unnecessary embellishment.
   - **Accessibility & Usability**:
   - Multi-language Toggle: Easily accessible language selection (Spanish, Portuguese, Haitian Creole) from the initial setup and within the app.
   - Readability: Ensure text size is adjustable or sufficiently large by default for users with varying visual abilities.
   - Intuitive Flows: Design the core actions (scanning, starting timer, marking done) to require minimal taps and clear feedback.
   - Clear State Indication: Visually distinct states for queue items (waiting, washing, finished, removed). For instance, a 'finished' item on the volunteer screen would flash red with clear text.
   - Error Prevention: Confirmations for critical actions like 'Remove from Queue' to prevent accidental data loss.
   - **Location Awareness (for Service Providers)**:
   - Clearly display the selected Laundry Love location at all times for Service Providers.
## 6. Narrative
Juan is a service user who is experiencing homelessness and wants to wash his clothes in a timely fashion with the aid of Queuert. He needs to achieve this goal to maintain personal hygiene, feel a sense of normalcy, and have clean clothes for daily life. Juan finds Queuert mentioned on the Laundry Love website and easily downloads the app from his phone's app store. He benefits from the app by being able to efficiently get his laundry done, knowing his place in line and when his wash will be ready, which helps him plan his day effectively.
## 7. Success metrics
### 7.1. User-centric metrics
   - All data is collected and stored in Google Sheets for easy editing and graph generation, serving as a primary database.
   - Average time Service Users spend in the queue (aim for reduction compared to manual process).
   - Average wait time for an available washer slot (aim for reduction).
   - Percentage of Service Users who successfully complete the digital intake form.
   - Number of unique Service Users served per Laundry Love event.
   - Service Provider feedback on the app's ease of use and impact on their workflow.
### 7.2. Business metrics
   - Number of people signed up per event, viewable on Google Sheets.
   - Number of new Service Users registered through the app per event.
   - Number of active wash cycles managed per event.
   - Reduction in paper forms used during Laundry Love events.
   - Data completeness rate for intake forms (e.g., >90% of required fields filled).
   - Volunteer satisfaction scores regarding app usage and overall event management.
### 7.3. Technical metrics
   - Long-term app usage: The app is actively used for subsequent Laundry Love events beyond the initial rollout period.
   - App uptime (e.g., >99.9%).
   - Percentage of successful notification deliveries (push notifications to Service Providers, SMS to Service Users).
   - Data synchronization success rate with Google Sheets (e.g., >99% of records successfully transferred).
   - App crash rate (aim for less than 0.1% of sessions).
   - Average load times for key queue screens (e.g., less than 3 seconds).
## 8. Technical considerations
### 8.1. Integration points
   - Google Sheets API: For primary data storage (queue, user intake forms, timer events, volunteer QR code assignments).
   - SMS Gateway API: For sending text notifications to Service Users (e.g., Twilio, Nexmo).
   - Push Notification Service: For sending push notifications to Service Providers (e.g., Firebase Cloud Messaging for Android, Apple Push Notification Service for iOS).
   - QR Code Library/API: For generating and scanning QR codes within the app.
   - Authentication Service: For managing Service Provider logins and distinguishing roles (e.g., Firebase Auth, OAuth provider).
### 8.2. Data storage & privacy
   - Google Sheets: Primary structured data storage for long-term records.
   - On-Device Storage: Temporary local storage for offline access to queue data for Service Providers (if internet is spotty) and to maintain user's queue position/timer on their device.
   - Privacy by Design: Implement measures to protect sensitive user data (phone numbers, living situation).
   - Encryption: Data encrypted in transit (HTTPS/SSL) and at rest (Google Sheets' inherent encryption).
   - Access Control: Strict role-based access to sensitive data (e.g., Service Users only see their own queue position; Service Providers see all, but access to Google Sheet data is limited to authorized admins).
   - Data Minimization: Only collect data absolutely necessary for the service.
   - Anonymization/Pseudonymization: Consider methods to anonymize aggregate data for reporting/analysis, or pseudonymize personal identifiers where possible.
   - Consent: Clearly obtain explicit consent from Service Users for data collection and SMS notifications.
### 8.3. Scalability & performance
   - The app should be designed to handle up to 100 simultaneous Service Users and 10-15 simultaneous Service Providers per location without significant performance degradation, especially during peak 'large wave' times.
   - Real-time Updates: Ensure queue updates and timer synchronizations are near real-time across all connected Service Provider devices and for individual Service User views.
   - Efficient Data Handling: Optimize Google Sheets API calls to prevent rate limits and ensure quick read/write operations.
   - Offline Capabilities: Implement some level of offline capability for Service Providers, allowing them to continue managing the queue even with intermittent internet connectivity, with data syncing once connection is restored.
### 8.4. Potential challenges
   - Internet Connectivity: Laundry Love events may occur in locations with unreliable or slow Wi-Fi/cellular data, impacting real-time updates and Google Sheets synchronization.
   - SMS Delivery Reliability/Cost: Ensuring consistent SMS delivery across different carriers and managing potential costs for a high volume of messages.
   - Google Sheets API Limits: Hitting rate limits or exceeding daily quotas for Google Sheets API calls, especially with multiple locations and high user volume.
   - Timer Synchronization: Maintaining accurate and synchronized timers across multiple devices (Service Users and Service Providers) in real-time, especially with varying network conditions.
   - User Adoption: Ensuring Service Users (especially those with limited tech literacy) are comfortable using the app and providing information via QR code/forms.
   - Data Accuracy: Preventing accidental data entry errors by Service Providers or Service Users.
   - Device Compatibility: Ensuring the app functions correctly across a wide range of Android and iOS devices and operating system versions.
   - Security: Protecting against unauthorized access to the Google Sheet data, especially given the sensitive nature of some collected information.
## 9. Milestones & sequencing
### 9.1. Project estimate
   - Medium: 2 months
### 9.2. Team size & composition
   - Small Team: 1 total person
     - 1 full-stack developer (serving as Product Manager, Designer, Engineer, QA)
### 9.3. Suggested phases
   - **Phase 1: MVP Development & Initial Setup**: Develop core queue management, timer functionality, user onboarding (QR scan/manual add), basic Service User view, Service Provider queue view, multi-language support, and Google Sheets integration for data collection. (1 month)
     - Key deliverables: Functional Android/iOS app with core queue features, data logging to Google Sheets, working multi-language UI.
   - **Phase 2: Pilot, Feedback & Refinement**: Deploy MVP to one Laundry Love location for pilot testing, gather feedback from Service Users and Service Providers, identify bugs and areas for improvement. Implement critical bug fixes and minor UI/UX refinements based on pilot. (2 weeks)
     - Key deliverables: Pilot program completion, bug fix release, refined core user flows.
   - **Phase 3: Upgrade & Rollout**: Implement advanced features identified during feedback (e.g., enhanced search, improved notifications, robust offline mode), optimize performance and scalability. Prepare for broader rollout to all Laundry Love locations. (2.5 weeks)
     - Key deliverables: Feature enhancement release, performance optimizations, documentation for broader rollout.