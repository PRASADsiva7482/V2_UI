import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/common/Toast';
import { getUserSettings, updateUserSettings, deleteUserAccount } from '../services/api/settings';
import ToggleSwitch from '../components/common/ToggleSwitch';
import './Settings.css';

// U-2: SavedIndicator extracted to module level (was inside render body)
function SavedIndicator({ field, saveSuccess }) {
    return saveSuccess === field ? <span className="settings-saved-indicator">✓ Saved</span> : null;
}

// ============================
// U-1: EXTRACTED SUB-PAGE COMPONENTS  
// Each was previously defined inside the Settings() function body,
// causing them to be recreated on every render. Now they are stable,
// module-level components that receive shared state via props.
// ============================

function AccountSettings({ user, handleChangePassword, handleDeleteAccount, showDeleteModal, setShowDeleteModal, deleteConfirmText, setDeleteConfirmText, showPasswordModal, setShowPasswordModal, saving }) {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Your account</h2>
            <p className="settings-pane-desc">See information about your account, download an archive of your data, or learn about your account deactivation options.</p>

            <div className="settings-list">
                <div className="settings-list-item">
                    <div className="settings-item-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    </div>
                    <div className="settings-item-content">
                        <h3>Account information</h3>
                        <p>Username: @{user?.username || 'N/A'}</p>
                        {user?.email && <p>Email: {user.email}</p>}
                    </div>
                </div>

                <div className="settings-list-item" onClick={handleChangePassword}>
                    <div className="settings-item-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                    </div>
                    <div className="settings-item-content">
                        <h3>Change your password</h3>
                        <p>Change your password at any time via your identity provider.</p>
                    </div>
                    <div className="settings-item-arrow">›</div>
                </div>

                <div className="settings-list-item" onClick={() => setShowDeleteModal(true)}>
                    <div className="settings-item-icon danger-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                    </div>
                    <div className="settings-item-content">
                        <h3 className="danger-text">Deactivate or delete your account</h3>
                        <p>Permanently remove your account, data, and identity from the system and Keycloak.</p>
                    </div>
                    <div className="settings-item-arrow">›</div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="settings-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-modal-header">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="#f4212e"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                            <h3>Delete your account?</h3>
                        </div>
                        <p>This will permanently delete your account, all your posts, messages, and profile data. Your identity will also be removed from the authentication server (Keycloak).</p>
                        <p><strong>This action cannot be undone.</strong></p>
                        <div className="settings-modal-confirm">
                            <label>Type <strong>DELETE</strong> to confirm:</label>
                            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="settings-confirm-input" />
                        </div>
                        <div className="settings-modal-actions">
                            <button className="settings-btn-cancel" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>Cancel</button>
                            <button className="settings-btn-danger" onClick={handleDeleteAccount} disabled={saving || deleteConfirmText !== 'DELETE'}>
                                {saving ? 'Deleting...' : 'Delete my account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="settings-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Change Password</h3>
                        <p>Your password is managed by Keycloak (identity provider). To change it, access the Keycloak Account Management portal directly.</p>
                        <div className="settings-modal-actions">
                            <button className="settings-btn-cancel" onClick={() => setShowPasswordModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SecuritySettings({ settings, handleSettingChange, saveSuccess }) {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Security and account access</h2>
            <p className="settings-pane-desc">Manage your account's security and keep track of your account's usage including apps, sessions, and account activity.</p>

            <div className="settings-section-title">Security</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text">
                        <h3>Two-factor authentication</h3>
                        <p>Help protect your account from unauthorized access by requiring a second authentication method in addition to your password.</p>
                    </div>
                    <div className="settings-control-actions">
                        <select value={settings?.twoFactorAuth || 'NONE'} onChange={(e) => handleSettingChange('twoFactorAuth', e.target.value)}>
                            <option value="NONE">Off</option>
                            <option value="SMS">Text message (SMS)</option>
                            <option value="APP">Authentication app</option>
                            <option value="SECURITY_KEY">Security key</option>
                        </select>
                        <SavedIndicator field="twoFactorAuth" saveSuccess={saveSuccess} />
                    </div>
                </div>

                <div className="settings-control">
                    <div className="settings-control-text">
                        <h3>Additional password protection</h3>
                        <p>Require additional personal information to reset your password.</p>
                    </div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.passwordProtection || false} onChange={(v) => handleSettingChange('passwordProtection', v)} label="Password protection" />
                        <SavedIndicator field="passwordProtection" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Apps and sessions</div>
            <div className="settings-control">
                <div className="settings-control-text">
                    <h3>Track active sessions</h3>
                    <p>Log location and device information for your active sessions.</p>
                </div>
                <div className="settings-control-actions">
                    <ToggleSwitch checked={settings?.appSessionsTracking ?? true} onChange={(v) => handleSettingChange('appSessionsTracking', v)} label="Session tracking" />
                    <SavedIndicator field="appSessionsTracking" saveSuccess={saveSuccess} />
                </div>
            </div>
        </div>
    );
}

function PrivacySettings({ settings, handleSettingChange, saveSuccess }) {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Privacy and safety</h2>
            <p className="settings-pane-desc">Manage what information you see and share on the platform.</p>

            <div className="settings-section-title">Audience, media and tagging</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Protect your posts</h3><p>When selected, your posts and other account information are only visible to people who follow you.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.protectPosts || false} onChange={(v) => handleSettingChange('protectPosts', v)} label="Protect posts" />
                        <SavedIndicator field="protectPosts" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Photo tagging</h3><p>Allow people to tag you in their photos.</p></div>
                    <div className="settings-control-actions">
                        <select value={settings?.photoTagging || 'ANYONE'} onChange={(e) => handleSettingChange('photoTagging', e.target.value)}>
                            <option value="ANYONE">Anyone can tag you</option>
                            <option value="FOLLOWING">Only people you follow</option>
                            <option value="OFF">Off</option>
                        </select>
                        <SavedIndicator field="photoTagging" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Your posts</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Mark media you post as having sensitive content</h3><p>When enabled, pictures and videos you post will be marked as sensitive for people who don't want to see sensitive content.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.sensitiveMedia ?? true} onChange={(v) => handleSettingChange('sensitiveMedia', v)} label="Sensitive media" />
                        <SavedIndicator field="sensitiveMedia" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Add location information to your posts</h3><p>When enabled, your posts may include location information.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.locationInfo || false} onChange={(v) => handleSettingChange('locationInfo', v)} label="Location info" />
                        <SavedIndicator field="locationInfo" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Direct messages</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Allow message requests from</h3><p>People who you don't follow will still be able to send you message requests depending on this setting.</p></div>
                    <div className="settings-control-actions">
                        <select value={settings?.directMessagePrivacy || 'EVERYONE'} onChange={(e) => handleSettingChange('directMessagePrivacy', e.target.value)}>
                            <option value="EVERYONE">Everyone</option>
                            <option value="FOLLOWING">Only people you follow</option>
                            <option value="NONE">No one</option>
                        </select>
                        <SavedIndicator field="directMessagePrivacy" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Show read receipts</h3><p>Let people you're messaging know when you've seen their messages. Read receipts are not shown on message requests.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.readReceipts ?? true} onChange={(v) => handleSettingChange('readReceipts', v)} label="Read receipts" />
                        <SavedIndicator field="readReceipts" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Discoverability and contacts</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Let others find you by email</h3><p>Let people who have your email address find and connect with you here.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.discoverableByEmail ?? true} onChange={(v) => handleSettingChange('discoverableByEmail', v)} label="Discoverable by email" />
                        <SavedIndicator field="discoverableByEmail" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Let others find you by phone</h3><p>Let people who have your phone number find and connect with you here.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.discoverableByPhone ?? true} onChange={(v) => handleSettingChange('discoverableByPhone', v)} label="Discoverable by phone" />
                        <SavedIndicator field="discoverableByPhone" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Data sharing and personalization</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Personalized ads</h3><p>You will always see ads, but they can be personalized using your activity, profile, and other information.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.allowPersonalizedAds ?? true} onChange={(v) => handleSettingChange('allowPersonalizedAds', v)} label="Personalized ads" />
                        <SavedIndicator field="allowPersonalizedAds" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Data sharing with business partners</h3><p>Allow sharing of additional information with our partnered services.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.allowDataSharing || false} onChange={(v) => handleSettingChange('allowDataSharing', v)} label="Data sharing" />
                        <SavedIndicator field="allowDataSharing" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings({ settings, handleSettingChange, saveSuccess }) {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Notifications</h2>
            <p className="settings-pane-desc">Select the kinds of notifications you get about your activities, interests, and recommendations.</p>

            <div className="settings-section-title">Filters</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Quality filter</h3><p>Filter lower-quality content from your notifications. This won't filter out notifications from people you follow or accounts you've recently interacted with.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.qualityFilter ?? true} onChange={(v) => handleSettingChange('qualityFilter', v)} label="Quality filter" />
                        <SavedIndicator field="qualityFilter" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Mute notifications from people you don't follow</h3><p>When enabled, you won't receive notifications from users you're not following.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.muteAccountsNotFollowing || false} onChange={(v) => handleSettingChange('muteAccountsNotFollowing', v)} label="Mute non-followers" />
                        <SavedIndicator field="muteAccountsNotFollowing" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Mute notifications from new accounts</h3><p>When enabled, you won't receive notifications from accounts created recently.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.muteAccountsNew || false} onChange={(v) => handleSettingChange('muteAccountsNew', v)} label="Mute new accounts" />
                        <SavedIndicator field="muteAccountsNew" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Preferences</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Push notifications</h3><p>Get push notifications to find out what's going on when you're not on the app. You can turn them off anytime.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.pushNotifications ?? true} onChange={(v) => handleSettingChange('pushNotifications', v)} label="Push notifications" />
                        <SavedIndicator field="pushNotifications" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Email notifications</h3><p>Get emails to find out what's going on when you're not on the app. You can turn them off anytime.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.emailNotifications ?? true} onChange={(v) => handleSettingChange('emailNotifications', v)} label="Email notifications" />
                        <SavedIndicator field="emailNotifications" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>SMS notifications</h3><p>Get text messages for important account alerts and notifications.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.smsNotifications || false} onChange={(v) => handleSettingChange('smsNotifications', v)} label="SMS notifications" />
                        <SavedIndicator field="smsNotifications" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccessibilitySettings({ settings, handleSettingChange, handleThemeChange, handleLanguageChange, saveSuccess, i18n }) {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Accessibility, display, and languages</h2>
            <p className="settings-pane-desc">Manage how content is displayed to you.</p>

            <div className="settings-section-title">Display</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Background</h3><p>Choose your preferred background theme.</p></div>
                    <div className="settings-theme-selector">
                        <button className={`settings-theme-btn ${(settings?.appearanceTheme || 'LIGHT') === 'LIGHT' ? 'active' : ''}`} onClick={() => handleThemeChange('LIGHT')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="5" /><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
                            <span>Light</span>
                        </button>
                        <button className={`settings-theme-btn ${(settings?.appearanceTheme || 'LIGHT') === 'DARK' ? 'active' : ''}`} onClick={() => handleThemeChange('DARK')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            <span>Dark</span>
                        </button>
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Font size</h3><p>Choose the size of text in the application.</p></div>
                    <div className="settings-control-actions">
                        <select value={settings?.fontSize || 'DEFAULT'} onChange={(e) => handleSettingChange('fontSize', e.target.value)}>
                            <option value="SMALL">Small</option>
                            <option value="DEFAULT">Default</option>
                            <option value="LARGE">Large</option>
                            <option value="EXTRA_LARGE">Extra Large</option>
                        </select>
                        <SavedIndicator field="fontSize" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Accessibility</div>
            <div className="settings-control-group">
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Reduce motion</h3><p>Reduces the motion of in-app animations including live engagement counts.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.reduceMotion || false} onChange={(v) => handleSettingChange('reduceMotion', v)} label="Reduce motion" />
                        <SavedIndicator field="reduceMotion" saveSuccess={saveSuccess} />
                    </div>
                </div>
                <div className="settings-control">
                    <div className="settings-control-text"><h3>Data saver</h3><p>If enabled, images and videos will load in lower quality to save data bandwidth.</p></div>
                    <div className="settings-control-actions">
                        <ToggleSwitch checked={settings?.dataSaver || false} onChange={(v) => handleSettingChange('dataSaver', v)} label="Data saver" />
                        <SavedIndicator field="dataSaver" saveSuccess={saveSuccess} />
                    </div>
                </div>
            </div>

            <div className="settings-section-title">Languages</div>
            <div className="settings-control">
                <div className="settings-control-text"><h3>Display language</h3><p>Select your preferred language for headlines, buttons, and other text in the app.</p></div>
                <div className="settings-control-actions">
                    <select value={settings?.displayLanguage || i18n.language} onChange={(e) => handleLanguageChange(e.target.value)}>
                        <option value="en">English</option>
                        <option value="tel">తెలుగు (Telugu)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="ko">한국어 (Korean)</option>
                        <option value="zh">中文 (Chinese)</option>
                        <option value="ar">العربية (Arabic)</option>
                        <option value="pt">Português (Portuguese)</option>
                    </select>
                    <SavedIndicator field="displayLanguage" saveSuccess={saveSuccess} />
                </div>
            </div>
        </div>
    );
}

function AboutSettings() {
    return (
        <div className="settings-pane">
            <h2 className="settings-pane-title">Additional resources</h2>
            <p className="settings-pane-desc">Check out other places for helpful information to learn more about our platform and practices.</p>

            <div className="settings-section-title">Legal</div>
            <div className="settings-list">
                <div className="settings-list-item">
                    <div className="settings-item-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>
                    <div className="settings-item-content"><h3>Terms of Service</h3></div>
                    <div className="settings-item-arrow">›</div>
                </div>
                <div className="settings-list-item">
                    <div className="settings-item-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg></div>
                    <div className="settings-item-content"><h3>Privacy Policy</h3></div>
                    <div className="settings-item-arrow">›</div>
                </div>
                <div className="settings-list-item">
                    <div className="settings-item-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5V8h14v10z" /></svg></div>
                    <div className="settings-item-content"><h3>Cookie Policy</h3></div>
                    <div className="settings-item-arrow">›</div>
                </div>
            </div>

            <div className="settings-section-title">Miscellaneous</div>
            <div className="settings-list">
                <div className="settings-list-item">
                    <div className="settings-item-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg></div>
                    <div className="settings-item-content"><h3>About Us</h3></div>
                    <div className="settings-item-arrow">›</div>
                </div>
                <div className="settings-list-item">
                    <div className="settings-item-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg></div>
                    <div className="settings-item-content"><h3>Release notes</h3><p>v2.0 - Social media application</p></div>
                    <div className="settings-item-arrow">›</div>
                </div>
            </div>
        </div>
    );
}

// ============================
// MAIN SETTINGS SHELL 
// ============================
function Settings() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, logout, keycloak } = useAuth();
    const { showToast } = useToast();

    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (saveSuccess) {
            const timer = setTimeout(() => setSaveSuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveSuccess]);

    const loadSettings = async () => {
        try {
            const data = await getUserSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
            setSettings({
                twoFactorAuth: 'NONE', passwordProtection: false, appSessionsTracking: true,
                protectPosts: false, photoTagging: 'ANYONE', locationInfo: false, sensitiveMedia: true,
                directMessagePrivacy: 'EVERYONE', readReceipts: true, discoverableByEmail: true,
                discoverableByPhone: true, allowPersonalizedAds: true, allowDataSharing: false,
                qualityFilter: true, muteAccountsNotFollowing: false, muteAccountsNew: false,
                pushNotifications: true, emailNotifications: true, smsNotifications: false,
                displayLanguage: i18n.language || 'en',
                appearanceTheme: theme === 'dark' ? 'DARK' : 'LIGHT',
                fontSize: 'DEFAULT', reduceMotion: false, dataSaver: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        try {
            setSaving(true);
            await updateUserSettings({ [key]: value });
            setSaveSuccess(key);
        } catch (error) {
            console.error('Failed to save setting', error);
            loadSettings();
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        const currentTheme = theme === 'dark' ? 'DARK' : 'LIGHT';
        if (currentTheme !== newTheme) {
            toggleTheme();
        }
        handleSettingChange('appearanceTheme', newTheme);
    };

    const handleLanguageChange = (code) => {
        i18n.changeLanguage(code);
        handleSettingChange('displayLanguage', code);
    };

    const handleChangePassword = () => {
        if (keycloak) {
            const accountUrl = keycloak.createAccountUrl();
            if (accountUrl) {
                window.open(accountUrl, '_blank');
                return;
            }
        }
        setShowPasswordModal(true);
    };

    const handleDeleteAccount = async () => {
        try {
            setSaving(true);
            await deleteUserAccount();
            logout();
        } catch (error) {
            console.error('Failed to delete account', error);
            // U-9: Use toast instead of alert()
            showToast('Error deleting account. Please contact support.', 'error');
        } finally {
            setSaving(false);
            setShowDeleteModal(false);
            setDeleteConfirmText('');
        }
    };

    if (loading) return (
        <div className="settings-loading">
            <div className="settings-loading-spinner"></div>
            <span>Loading settings...</span>
        </div>
    );

    const pathParts = location.pathname.replace('/settings', '').split('/').filter(Boolean);
    const currentPath = pathParts[0] || '';

    const NAV_ITEMS = [
        { key: 'account', label: 'Your account', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
        { key: 'security', label: 'Security and account access', icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
        { key: 'privacy', label: 'Privacy and safety', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' },
        { key: 'notifications', label: 'Notifications', icon: 'M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2zM4.372 16l.928-7.276C5.678 5.707 8.523 4 12 4s6.321 1.707 6.7 4.724L19.628 16H4.372z' },
        { key: 'accessibility', label: 'Accessibility, display, and languages', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
        { key: 'about', label: 'Additional resources', icon: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
    ];

    // Shared props for sub-pages
    const sharedProps = { settings, handleSettingChange, saveSuccess };

    return (
        <div className="settings-page" id="settings-page">
            <div className={`settings-sidebar ${currentPath ? 'hidden-mobile' : ''}`}>
                <div className="settings-sidebar-header">
                    <h2>Settings</h2>
                </div>
                <div className="settings-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`settings-nav-item ${currentPath === item.key ? 'active' : ''}`}
                            onClick={() => navigate(`/settings/${item.key}`)}
                        >
                            <div className="settings-nav-icon">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d={item.icon} /></svg>
                            </div>
                            <span className="settings-nav-label">{item.label}</span>
                            <span className="settings-nav-arrow">›</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`settings-content ${!currentPath ? 'hidden-mobile' : ''}`}>
                {currentPath && (
                    <div className="settings-back-header">
                        <button className="settings-back-btn" onClick={() => navigate('/settings')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                        </button>
                        <h2 className="settings-content-title">
                            {NAV_ITEMS.find(n => n.key === currentPath)?.label || 'Settings'}
                        </h2>
                    </div>
                )}

                <Routes>
                    <Route path="/" element={
                        <div className="settings-empty-state">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                            <h3>Select a settings category</h3>
                            <p>Choose from the menu on the left to view and update your settings.</p>
                        </div>
                    } />
                    <Route path="/account" element={
                        <AccountSettings
                            user={user}
                            handleChangePassword={handleChangePassword}
                            handleDeleteAccount={handleDeleteAccount}
                            showDeleteModal={showDeleteModal}
                            setShowDeleteModal={setShowDeleteModal}
                            deleteConfirmText={deleteConfirmText}
                            setDeleteConfirmText={setDeleteConfirmText}
                            showPasswordModal={showPasswordModal}
                            setShowPasswordModal={setShowPasswordModal}
                            saving={saving}
                        />
                    } />
                    <Route path="/security" element={<SecuritySettings {...sharedProps} />} />
                    <Route path="/privacy" element={<PrivacySettings {...sharedProps} />} />
                    <Route path="/notifications" element={<NotificationSettings {...sharedProps} />} />
                    <Route path="/accessibility" element={
                        <AccessibilitySettings {...sharedProps} handleThemeChange={handleThemeChange} handleLanguageChange={handleLanguageChange} i18n={i18n} />
                    } />
                    <Route path="/about" element={<AboutSettings />} />
                </Routes>
            </div>

            {saving && (
                <div className="settings-saving-toast">
                    <div className="settings-saving-spinner"></div>
                    Saving...
                </div>
            )}
        </div>
    );
}

export default Settings;
