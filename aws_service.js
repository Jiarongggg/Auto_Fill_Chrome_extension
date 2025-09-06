// ============================================
// STORAGE SERVICE FOR AUTOFILL EXTENSION
// ============================================

// Configuration for Zapkad API
const SERVICE_CONFIG = {
    // Set to false when connected to Zapkad's real API
    useMockService: true,
    
    // Zapkad API endpoints
    apiEndpoint: 'https://api.zapkad.com/autofill',
    apiKey: 'your-api-key-here',
    
    // Optional: for future AWS S3 integration
    bucketName: 'zapkad-user-profiles',
    aws: {
        region: 'us-east-1'
    }
};

// ============================================
// PROFILE STORAGE SERVICE
// ============================================
class StorageService {
    constructor(config = {}) {
        this.config = { ...SERVICE_CONFIG, ...config };
        this.useMockService = this.config.useMockService;
        
        console.log(`[AutoFill] Storage Service initialized in ${this.useMockService ? 'MOCK' : 'PRODUCTION'} mode`);
    }

    // Save user profile
    async saveProfile(profileData, userId) {
        if (this.useMockService) {
            return this.mockSaveProfile(profileData, userId);
        } else {
            return this.realSaveProfile(profileData, userId);
        }
    }

    // Load user profile
    async loadProfile(userId) {
        if (this.useMockService) {
            return this.mockLoadProfile(userId);
        } else {
            return this.realLoadProfile(userId);
        }
    }

    // ============================================
    // MOCK IMPLEMENTATION (For Testing)
    // ============================================
    
    async mockSaveProfile(profileData, userId) {
        console.debug('[AutoFill] Mock: Saving profile locally');
        
        // Simulate network delay
        await this.simulateNetworkDelay();
        
        // Save to Chrome local storage
        await chrome.storage.local.set({ 
            af_profile: profileData,
            af_profile_userId: userId,
            af_profile_lastSaved: Date.now()
        });
        
        return {
            success: true,
            userId: userId,
            timestamp: new Date().toISOString()
        };
    }

    async mockLoadProfile(userId) {
        console.debug('[AutoFill] Mock: Loading profile');
        
        // Simulate network delay
        await this.simulateNetworkDelay();
        
        // Mock company database with test users
        const mockDatabase = {
            'mock-user-123': {
                // Personal Information
                firstName: 'John',
                middleName: 'Michael',
                lastName: 'Doe',
                fullName: 'John Michael Doe',
                preferredName: 'Johnny',
                maidenName: '',
                
                // Contact Information
                email: 'john.doe@company.com',
                workEmail: 'jdoe@zapkad.com',
                phone: '+1-555-0123',
                altPhone: '+1-555-9876',
                
                // Demographics
                birthday: '1990-01-15',
                sex: 'Male',
                nationality: 'American',
                
                // Address
                address1: '123 Tech Street',
                address2: 'Suite 500',
                cityAddress: 'San Francisco',
                stateAddress: 'California',
                postalCode: '94105',
                countryAddress: 'United States',
                
                // Education
                university: 'Stanford University',
                degree: 'Bachelor of Science',
                major: 'Computer Science',
                gpa: '3.8',
                gradYear: '2012',
                
                // Professional
                employer: 'Zapkad Technologies',
                jobTitle: 'Senior Software Engineer',
                workExperience: '10',
                
                // Online Profiles
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe',
                website: 'https://johndoe.dev',
                
                // Additional Information
                languages: 'English, Spanish, Mandarin',
                skills: 'JavaScript, Python, AWS, Machine Learning, React, Node.js',
                summary: 'Senior Software Engineer with expertise in cloud architecture and machine learning. 10+ years of experience building scalable web applications.',
                
                // Company-specific fields (optional)
                employeeId: 'EMP-12345',
                department: 'Engineering'
            },
            'default': {
                // Personal Information
                firstName: 'Demo',
                middleName: '',
                lastName: 'User',
                fullName: 'Demo User',
                preferredName: '',
                maidenName: '',
                
                // Contact Information
                email: 'demo@example.com',
                workEmail: '',
                phone: '+1-555-0000',
                altPhone: '',
                
                // Demographics
                birthday: '1995-06-15',
                sex: 'Female',
                nationality: 'Canadian',
                
                // Address
                address1: '456 Demo Lane',
                address2: 'Apt 12B',
                cityAddress: 'New York',
                stateAddress: 'New York',
                postalCode: '10001',
                countryAddress: 'United States',
                
                // Education
                university: 'MIT',
                degree: 'Master of Science',
                major: 'Artificial Intelligence',
                gpa: '3.9',
                gradYear: '2017',
                
                // Professional
                employer: 'Tech Innovations Inc.',
                jobTitle: 'AI Research Scientist',
                workExperience: '5',
                
                // Online Profiles
                linkedin: 'https://linkedin.com/in/demouser',
                github: 'https://github.com/demouser',
                website: 'https://demo.example.com',
                
                // Additional Information
                languages: 'English, French',
                skills: 'Machine Learning, TensorFlow, PyTorch, Data Science, Research',
                summary: 'AI researcher and software developer passionate about machine learning and advancing artificial intelligence for social good.'
            },
            'test-user-empty': {
                // Empty profile for testing field identification
                firstName: '',
                middleName: '',
                lastName: '',
                fullName: '',
                preferredName: '',
                maidenName: '',
                email: '',
                workEmail: '',
                phone: '',
                altPhone: '',
                birthday: '',
                sex: '',
                nationality: '',
                address1: '',
                address2: '',
                cityAddress: '',
                stateAddress: '',
                postalCode: '',
                countryAddress: '',
                university: '',
                degree: '',
                major: '',
                gpa: '',
                gradYear: '',
                employer: '',
                jobTitle: '',
                workExperience: '',
                linkedin: '',
                github: '',
                website: '',
                languages: '',
                skills: '',
                summary: ''
            }
        };
        
        // Return specific user data or default
        const userData = mockDatabase[userId] || mockDatabase['default'];
        
        return {
            data: userData,
            metadata: {
                source: 'mock-database',
                userId: userId,
                lastModified: new Date().toISOString()
            }
        };
    }

    // ============================================
    // PRODUCTION IMPLEMENTATION (Zapkad API)
    // ============================================
    
    async realSaveProfile(profileData, userId) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/profiles/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: userId,
                    profileData: profileData,
                    updatedAt: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Save failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('[AutoFill] Failed to save profile:', error);
            // Fallback to local storage
            return this.mockSaveProfile(profileData, userId);
        }
    }

    async realLoadProfile(userId) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/profiles/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });
            
            if (response.status === 404) {
                // User has no profile yet, return default
                return this.mockLoadProfile('default');
            }
            
            if (!response.ok) {
                throw new Error(`Load failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                data: data.profileData,
                metadata: {
                    source: 'zapkad-api',
                    userId: userId,
                    lastModified: data.updatedAt
                }
            };
            
        } catch (error) {
            console.error('[AutoFill] Failed to load profile:', error);
            // Fallback to mock data
            return this.mockLoadProfile(userId);
        }
    }

    // ============================================
    // FIELD VALIDATION
    // ============================================
    
    validateProfileData(profileData) {
        const validFields = [
            // Personal
            'firstName', 'middleName', 'lastName', 'fullName', 'preferredName', 'maidenName',
            // Contact
            'email', 'workEmail', 'phone', 'altPhone',
            // Demographics
            'birthday', 'sex', 'nationality',
            // Address
            'address1', 'address2', 'cityAddress', 'stateAddress', 'postalCode', 'countryAddress',
            // Education
            'university', 'degree', 'major', 'gpa', 'gradYear',
            // Professional
            'employer', 'jobTitle', 'workExperience',
            // Online
            'linkedin', 'github', 'website',
            // Additional
            'languages', 'skills', 'summary'
        ];
        
        const validatedData = {};
        for (const field of validFields) {
            if (profileData[field] !== undefined) {
                validatedData[field] = profileData[field];
            }
        }
        
        return validatedData;
    }

    // ============================================
    // HELPER METHODS
    // ============================================
    
    async getAuthToken() {
        // Get token from Zapkad login session
        const session = await chrome.storage.local.get(['zapkad_auth_token']);
        return session.zapkad_auth_token || this.config.apiKey;
    }

    async getUserId() {
        // Get current user ID from Zapkad session
        const storage = await chrome.storage.local.get(['zapkad_user_id']);
        if (!storage.zapkad_user_id) {
            // Generate temporary ID for testing
            const tempId = 'user_' + Math.random().toString(36).substr(2, 9);
            await chrome.storage.local.set({ zapkad_user_id: tempId });
            return tempId;
        }
        return storage.zapkad_user_id;
    }

    simulateNetworkDelay() {
        const latency = 100 + Math.random() * 200; // 100-300ms
        return new Promise(resolve => setTimeout(resolve, latency));
    }
    
    // Export profile data as JSON
    async exportProfile(userId) {
        const profile = await this.loadProfile(userId);
        return JSON.stringify(profile.data, null, 2);
    }
    
    // Import profile data from JSON
    async importProfile(jsonData, userId) {
        try {
            const profileData = JSON.parse(jsonData);
            const validatedData = this.validateProfileData(profileData);
            return await this.saveProfile(validatedData, userId);
        } catch (error) {
            console.error('[AutoFill] Failed to import profile:', error);
            throw new Error('Invalid profile data format');
        }
    }
}

// ============================================
// EXPORT FOR USE IN CONTENT.JS
// ============================================
console.log('[AutoFill] Storage Service Module Loaded');

// Make service available globally for the extension
window.StorageService = StorageService;
window.SERVICE_CONFIG = SERVICE_CONFIG;