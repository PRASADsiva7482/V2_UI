import React from 'react';
import './Settings.css';

export function TermsOfService() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Terms of Service</h2>
            <p className="settings-pane-desc">Effective Date: March 2026</p>

            <div className="settings-legal-content">
                <h3>1. Introduction</h3>
                <p>Welcome to our Social Media Application ("we", "our", or "us"). By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>

                <h3>2. User Accounts</h3>
                <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>

                <h3>3. Content and Conduct</h3>
                <p>You are responsible for any content you post, share, or otherwise transmit through our platform. You agree not to post content that is:</p>
                <ul>
                    <li>Illegal, harmful, threatening, abusive, or harassing.</li>
                    <li>Defamatory, libelous, or invasive of another's privacy.</li>
                    <li>Infringing on any patent, trademark, trade secret, copyright, or other proprietary rights.</li>
                    <li>Spam, machine-generated, or unauthorized advertising.</li>
                </ul>

                <h3>4. Intellectual Property</h3>
                <p>The service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of our Application and its licensors.</p>

                <h3>5. Account Termination</h3>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h3>6. Changes to Terms</h3>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes.</p>
            </div>
        </div>
    );
}

export function PrivacyPolicy() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Privacy Policy</h2>
            <p className="settings-pane-desc">Effective Date: March 2026</p>

            <div className="settings-legal-content">
                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create or modify your account, post content, interact with other users, or communicate with us. This may include your name, email address, phone number, profile photo, and content you share.</p>

                <h3>2. How We Use Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, to personalize your experience, and to communicate with you. This includes showing you relevant content and targeted advertisements based on your preferences and interactions.</p>

                <h3>3. Sharing of Information</h3>
                <p>We may share information about you selectively when you choose to make your profile or posts public, when required by law, or with third-party vendors and service providers who need access to such information to carry out work on our behalf.</p>

                <h3>4. Security Measures</h3>
                <p>We implement sound security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We utilize industry-standard encryption protocols and regular security audits.</p>

                <h3>5. Your Choices</h3>
                <p>You can update your account information, adjust your privacy settings, and opt-out of certain notifications or data sharing features through your account settings panel at any time.</p>
            </div>
        </div>
    );
}

export function CookiePolicy() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Cookie Policy</h2>
            <p className="settings-pane-desc">Effective Date: March 2026</p>

            <div className="settings-legal-content">
                <h3>1. What Are Cookies</h3>
                <p>Cookies are small text files stored on your device when you visit a website. They hold information that allows the site to recognize your device, remember preferences, and understand how you interact with the platform.</p>

                <h3>2. How We Use Cookies</h3>
                <p>We use cookies and similar tracking technologies to:</p>
                <ul>
                    <li><strong>Authentication:</strong> Keep you logged in as you navigate the app.</li>
                    <li><strong>Security:</strong> Protect your account and detect unauthorized access.</li>
                    <li><strong>Preferences:</strong> Remember your settings, such as language and theme.</li>
                    <li><strong>Analytics:</strong> Understand how features are being used to improve our application.</li>
                    <li><strong>Advertising:</strong> Deliver targeted ads and measure their effectiveness (if enabled).</li>
                </ul>

                <h3>3. Third-Party Cookies</h3>
                <p>We may also allow certain third-party partners to place cookies on your device for analytics and advertising purposes. These third parties collect information about your online activities over time.</p>

                <h3>4. Managing Cookies</h3>
                <p>Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of our services.</p>
            </div>
        </div>
    );
}

export function AboutUs() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">About Us</h2>
            <p className="settings-pane-desc">Connecting people, sparking conversations.</p>

            <div className="settings-legal-content">
                <p>We built this platform with a simple mission: to empower individuals to share ideas, connect with communities, and discover what's happening around the world right now.</p>

                <h3>Our Vision</h3>
                <p>To create a global digital public square where every voice can be heard and meaningful conversations flourish without boundaries.</p>

                <h3>Community Guidelines</h3>
                <p>We believe in open expression, but we also prioritize safety and respect. Our community guidelines are designed to ensure that the platform remains a welcoming space for diverse perspectives, free from harassment, hate speech, and harmful content.</p>

                <h3>Open Source Integration</h3>
                <p>We are proud supporters of open-source technology. Our stack leverages modern frameworks, and we continuously strive to contribute back to the developer community.</p>
            </div>
        </div>
    );
}

export function ReleaseNotes() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Release Notes</h2>
            <p className="settings-pane-desc">Version Summary & Change Log</p>

            <div className="settings-legal-content">
                <h3>Version 2.0 (Latest release)</h3>
                <p>Welcome to our massive V2 update! We've overhauled the architecture, refreshed the UI, and added highly requested features to provide a smoother, more robust experience.</p>
                <ul>
                    <li><strong>Real-time Architecture:</strong> Built a comprehensive WebSocket network handling instant messaging, live notifications, and real-time typing indicators without polling.</li>
                    <li><strong>Advanced Post Management:</strong> Added timeline features enabling 15-minute edit windows and hard cascade deletes for posts and media.</li>
                    <li><strong>Enhanced Privacy & Settings:</strong> Over 20+ granular toggles introduced to manage everything from push notifications to data-saving modes and personalized ad tracking.</li>
                    <li><strong>Accessibility Controls:</strong> Comprehensive support for typography scaling, global reduce-motion functionality, and light/dark theme toggling.</li>
                    <li><strong>Security Posture:</strong> Advanced session tracking, dual-layer authentication preparations, and secure profile deletion capabilities via Keycloak integration.</li>
                </ul>

                <h3>Version 1.5.0</h3>
                <ul>
                    <li>Introduced hashtag aggregation.</li>
                    <li>Implemented file attachments in direct messages.</li>
                    <li>Performance optimizations for timeline fetching via cursor-based pagination.</li>
                </ul>

                <h3>Version 1.0.0</h3>
                <ul>
                    <li>Initial release.</li>
                    <li>Core functionality: user authentication, basic profiles, posting text and media, liking, and commenting.</li>
                </ul>
            </div>
        </div>
    );
}
