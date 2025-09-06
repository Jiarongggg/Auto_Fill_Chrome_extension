(function() {
    // Prevent multiple injections
    if (window.__AF_CONTENT_READY__) {
        console.log("[AutoFill] Script already injected, skipping");
        return;
    }

    // Mark readiness
    window.__AF_CONTENT_READY__ = true;
    console.debug("[AutoFill] content script loaded on", location.href);

// ============================================
// SMART NATIONALITY MATCHER CLASS
// ============================================
class SmartNationalityMatcher {
    constructor() {
        // Quick lookup for most common nationality mappings (covers 95% of cases)
        this.quickMap = {
            // Americas
            'american': ['United States', 'USA', 'US', 'United States of America', 'America', 'U.S.', 'U.S.A'],
            'canadian': ['Canada', 'Canadian', 'CA', 'CAN'],
            'mexican': ['Mexico', 'Mexican', 'MX', 'MEX'],
            'brazilian': ['Brazil', 'Brazilian', 'BR', 'Brasil'],
            'argentinian': ['Argentina', 'Argentinian', 'Argentine', 'AR', 'ARG'],
            
            // Europe  
            'british': ['United Kingdom', 'UK', 'British', 'Great Britain', 'GB', 'England', 'U.K.'],
            'french': ['France', 'French', 'FR', 'FRA'],
            'german': ['Germany', 'German', 'DE', 'Deutschland', 'GER', 'DEU'],
            'italian': ['Italy', 'Italian', 'IT', 'Italia', 'ITA'],
            'spanish': ['Spain', 'Spanish', 'ES', 'España', 'ESP'],
            'dutch': ['Netherlands', 'Dutch', 'NL', 'Holland', 'The Netherlands', 'NLD'],
            'swiss': ['Switzerland', 'Swiss', 'CH', 'CHE'],
            'swedish': ['Sweden', 'Swedish', 'SE', 'SWE'],
            'norwegian': ['Norway', 'Norwegian', 'NO', 'NOR'],
            'danish': ['Denmark', 'Danish', 'DK', 'DNK'],
            'polish': ['Poland', 'Polish', 'PL', 'POL'],
            'irish': ['Ireland', 'Irish', 'IE', 'Republic of Ireland', 'Eire', 'IRL'],
            'portuguese': ['Portugal', 'Portuguese', 'PT', 'PRT'],
            'belgian': ['Belgium', 'Belgian', 'BE', 'BEL'],
            'austrian': ['Austria', 'Austrian', 'AT', 'AUT'],
            'finnish': ['Finland', 'Finnish', 'FI', 'FIN'],
            'greek': ['Greece', 'Greek', 'GR', 'GRC'],
            'czech': ['Czech Republic', 'Czech', 'CZ', 'Czechia', 'CZE'],
            'hungarian': ['Hungary', 'Hungarian', 'HU', 'HUN'],
            'romanian': ['Romania', 'Romanian', 'RO', 'ROU'],
            'bulgarian': ['Bulgaria', 'Bulgarian', 'BG', 'BGR'],
            'croatian': ['Croatia', 'Croatian', 'HR', 'HRV'],
            'serbian': ['Serbia', 'Serbian', 'RS', 'SRB'],
            'ukrainian': ['Ukraine', 'Ukrainian', 'UA', 'UKR'],
            'russian': ['Russia', 'Russian', 'RU', 'Russian Federation', 'RUS'],
            
            // Asia-Pacific
            'chinese': ['China', 'Chinese', 'CN', "People's Republic of China", 'PRC', 'CHN'],
            'japanese': ['Japan', 'Japanese', 'JP', 'JPN'],
            'korean': ['South Korea', 'Korean', 'KR', 'Korea', 'Republic of Korea', 'KOR'],
            'indian': ['India', 'Indian', 'IN', 'IND'],
            'pakistani': ['Pakistan', 'Pakistani', 'PK', 'PAK'],
            'bangladeshi': ['Bangladesh', 'Bangladeshi', 'BD', 'BGD'],
            'indonesian': ['Indonesia', 'Indonesian', 'ID', 'IDN'],
            'thai': ['Thailand', 'Thai', 'TH', 'THA'],
            'vietnamese': ['Vietnam', 'Vietnamese', 'VN', 'VNM'],
            'filipino': ['Philippines', 'Filipino', 'PH', 'Philippine', 'PHL'],
            'malaysian': ['Malaysia', 'Malaysian', 'MY', 'MYS'],
            'singaporean': ['Singapore', 'Singaporean', 'SG', 'SGP'],
            'taiwanese': ['Taiwan', 'Taiwanese', 'TW', 'Chinese Taipei', 'Republic of China', 'TWN'],
            'hong kong': ['Hong Kong', 'HK', 'Hong Kong SAR', 'Hongkonger', 'HKG'],
            'australian': ['Australia', 'Australian', 'AU', 'AUS'],
            'new zealander': ['New Zealand', 'New Zealander', 'NZ', 'Kiwi', 'NZL'],
            
            // Middle East & Africa
            'israeli': ['Israel', 'Israeli', 'IL', 'ISR'],
            'saudi': ['Saudi Arabia', 'Saudi', 'SA', 'KSA', 'Saudi Arabian', 'SAU'],
            'emirati': ['United Arab Emirates', 'UAE', 'Emirati', 'AE', 'ARE'],
            'turkish': ['Turkey', 'Turkish', 'TR', 'Türkiye', 'TUR'],
            'iranian': ['Iran', 'Iranian', 'IR', 'Persian', 'IRN'],
            'egyptian': ['Egypt', 'Egyptian', 'EG', 'EGY'],
            'south african': ['South Africa', 'South African', 'ZA', 'RSA', 'ZAF'],
            'nigerian': ['Nigeria', 'Nigerian', 'NG', 'NGA'],
            'kenyan': ['Kenya', 'Kenyan', 'KE', 'KEN'],
            'moroccan': ['Morocco', 'Moroccan', 'MA', 'MAR'],
            'ethiopian': ['Ethiopia', 'Ethiopian', 'ET', 'ETH']
        };
        
        // Transformation rules for nationality to country patterns
        this.transformRules = [
            // -ian pattern: Italian -> Italy, Canadian -> Canada
            { 
                pattern: /^(.+)ian$/i, 
                transform: (match) => {
                    const base = match[1];
                    const baseL = base.toLowerCase();
                    if (baseL === 'brasil') return 'Brazil';
                    if (baseL === 'argentin') return 'Argentina';
                    if (baseL === 'ital') return 'Italy';
                    if (baseL === 'canad') return 'Canada';
                    if (baseL === 'indian') return 'India';
                    if (baseL === 'austral') return 'Australia';
                    if (baseL === 'belg') return 'Belgium';
                    if (baseL === 'hungar') return 'Hungary';
                    if (baseL === 'roman') return 'Romania';
                    if (baseL === 'bulgar') return 'Bulgaria';
                    if (baseL === 'croat') return 'Croatia';
                    if (baseL === 'serb') return 'Serbia';
                    if (baseL === 'ukrain') return 'Ukraine';
                    if (baseL === 'russ') return 'Russia';
                    if (baseL === 'iran') return 'Iran';
                    if (baseL === 'egypt') return 'Egypt';
                    if (baseL === 'ethiop') return 'Ethiopia';
                    if (baseL === 'niger') return 'Nigeria';
                    if (baseL === 'kenya') return 'Kenya';
                    return base + 'ia';
                }
            },
            // -ish pattern: Spanish -> Spain, Turkish -> Turkey
            { 
                pattern: /^(.+)ish$/i, 
                transform: (match) => {
                    const base = match[1];
                    const baseL = base.toLowerCase();
                    if (baseL === 'span') return 'Spain';
                    if (baseL === 'brit') return 'United Kingdom';
                    if (baseL === 'ir') return 'Ireland';
                    if (baseL === 'turk') return 'Turkey';
                    if (baseL === 'pol') return 'Poland';
                    if (baseL === 'finn') return 'Finland';
                    if (baseL === 'dan') return 'Denmark';
                    if (baseL === 'swed') return 'Sweden';
                    return base + 'land';
                }
            },
            // -ese pattern: Chinese -> China, Japanese -> Japan
            { 
                pattern: /^(.+)ese$/i, 
                transform: (match) => {
                    const base = match[1];
                    const baseL = base.toLowerCase();
                    if (baseL === 'chin') return 'China';
                    if (baseL === 'japan') return 'Japan';
                    if (baseL === 'vietnam') return 'Vietnam';
                    if (baseL === 'portugu') return 'Portugal';
                    if (baseL === 'maltes') return 'Malta';
                    if (baseL === 'sudan') return 'Sudan';
                    if (baseL === 'taiwan') return 'Taiwan';
                    if (baseL === 'nepal') return 'Nepal';
                    if (baseL === 'burm') return 'Myanmar';
                    if (baseL === 'leban') return 'Lebanon';
                    if (baseL === 'senegal') return 'Senegal';
                    return base;
                }
            },
            // -an pattern: American -> America/United States, Korean -> Korea
            { 
                pattern: /^(.+)an$/i, 
                transform: (match) => {
                    const base = match[1];
                    const baseL = base.toLowerCase();
                    if (baseL === 'americ') return 'United States';
                    if (baseL === 'mexic') return 'Mexico';
                    if (baseL === 'kore') return 'South Korea';
                    if (baseL === 'morocc') return 'Morocco';
                    if (baseL === 'germ') return 'Germany';
                    if (baseL === 'austri') return 'Austria';
                    if (baseL === 'europe') return 'Europe';
                    if (baseL === 'afric') return 'Africa';
                    if (baseL === 'asi') return 'Asia';
                    return base;
                }
            },
            // -i pattern: Saudi -> Saudi Arabia, Israeli -> Israel
            { 
                pattern: /^(.+)i$/i, 
                transform: (match) => {
                    const base = match[1];
                    const baseL = base.toLowerCase();
                    if (baseL === 'saud') return 'Saudi Arabia';
                    if (baseL === 'israel') return 'Israel';
                    if (baseL === 'pakistan') return 'Pakistan';
                    if (baseL === 'iraq') return 'Iraq';
                    if (baseL === 'bangladesh') return 'Bangladesh';
                    if (baseL === 'emirat') return 'United Arab Emirates';
                    if (baseL === 'kuwait') return 'Kuwait';
                    if (baseL === 'bahrain') return 'Bahrain';
                    if (baseL === 'oman') return 'Oman';
                    if (baseL === 'yemen') return 'Yemen';
                    if (baseL === 'somal') return 'Somalia';
                    return base;
                }
            }
        ];
    }
    
    // Levenshtein distance for fuzzy matching
    levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];
        
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[len2][len1];
    }
    
    // Calculate similarity score between two strings
    fuzzyMatch(str1, str2) {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        if (s1 === s2) return 1.0;
        
        const distance = this.levenshteinDistance(s1, s2);
        const maxLen = Math.max(s1.length, s2.length);
        
        if (maxLen === 0) return 1.0;
        
        return 1 - (distance / maxLen);
    }
    
    // Main matching function
    match(nationality, optionText) {
        if (!nationality || !optionText) return { confidence: 0, method: 'none' };
        
        const natLower = nationality.toLowerCase().trim();
        const optLower = optionText.toLowerCase().trim();
        
        // 1. Try quick lookup first (fastest, covers most common cases)
        if (this.quickMap[natLower]) {
            for (const variant of this.quickMap[natLower]) {
                if (optLower === variant.toLowerCase() || 
                    optionText === variant || // Exact case match
                    optLower.includes(variant.toLowerCase()) ||
                    variant.toLowerCase().includes(optLower)) {
                    return { confidence: 1.0, method: 'quick-lookup' };
                }
            }
        }
        
        // Also check if option text is a key in quickMap
        for (const [key, values] of Object.entries(this.quickMap)) {
            if (values.some(v => v.toLowerCase() === natLower)) {
                // Found nationality in values, now check if option matches the key or other values
                if (key === optLower || values.some(v => v.toLowerCase() === optLower || v === optionText)) {
                    return { confidence: 1.0, method: 'quick-lookup-reverse' };
                }
            }
        }
        
        // 2. Try transformation rules
        for (const rule of this.transformRules) {
            const match = nationality.match(rule.pattern);
            if (match) {
                const predicted = rule.transform(match);
                if (predicted) {
                    // Check exact match
                    if (predicted.toLowerCase() === optLower || predicted === optionText) {
                        return { confidence: 0.95, method: 'transformation-exact' };
                    }
                    // Check fuzzy match
                    const similarity = this.fuzzyMatch(predicted, optionText);
                    if (similarity > 0.85) {
                        return { confidence: similarity * 0.9, method: 'transformation-fuzzy' };
                    }
                }
            }
        }
        
        // 3. Try fuzzy matching as fallback
        const similarity = this.fuzzyMatch(nationality, optionText);
        if (similarity > 0.7) {
            return { confidence: similarity * 0.8, method: 'fuzzy' };
        }
        
        // 4. Check for substring matches (last resort)
        if (natLower.length > 4) {
            if (optLower.includes(natLower) || natLower.includes(optLower)) {
                return { confidence: 0.6, method: 'substring' };
            }
        }
        
        return { confidence: 0, method: 'none' };
    }
    
    // Find best matching option in a select element
    findBestOption(select, nationality) {
        if (!nationality) return null;
        
        let bestOption = null;
        let bestScore = 0;
        let bestMethod = 'none';
        
        // Special handling for "American" to prioritize "United States" variants
        const natLower = nationality.toLowerCase().trim();
        if (natLower === 'american') {
            // First, look for exact "United States" variants
            const usVariants = ['United States of America', 'United States', 'USA', 'US', 'U.S.A', 'U.S.'];
            
            for (const option of select.options) {
                if (!option.value) continue;
                
                const optionText = (option.textContent || option.innerText || '').trim();
                const optionValue = option.value.trim();
                
                for (const variant of usVariants) {
                    if (optionText === variant || optionValue === variant ||
                        optionText.toLowerCase() === variant.toLowerCase() ||
                        optionValue.toLowerCase() === variant.toLowerCase()) {
                        
                        if (DEBUG_MODE) {
                            console.log(`✅ [SmartNationalityMatcher] Special handling: "American" → "${optionText}" (exact US variant match)`);
                        }
                        return option;
                    }
                }
            }
        }
        
        // Regular matching for all cases
        for (const option of select.options) {
            if (!option.value) continue; // Skip empty options
            
            const optionText = (option.textContent || option.innerText || '').trim();
            const result = this.match(nationality, optionText);
            
            if (result.confidence > bestScore) {
                bestScore = result.confidence;
                bestOption = option;
                bestMethod = result.method;
            }
            
            // Also check against option value
            const valueResult = this.match(nationality, option.value);
            if (valueResult.confidence > bestScore) {
                bestScore = valueResult.confidence;
                bestOption = option;
                bestMethod = valueResult.method;
            }
        }
        
        if (DEBUG_MODE && nationality) {
            if (bestOption) {
                console.log(`✅ [SmartNationalityMatcher] Matched "${nationality}" → "${bestOption.textContent}" (confidence: ${bestScore.toFixed(2)}, method: ${bestMethod})`);
            } else {
                console.log(`❌ [SmartNationalityMatcher] No match found for "${nationality}"`);
            }
        }
        
        // Use a stricter threshold - increased from 0.6 to 0.7
        if (bestScore >= 0.7) {
            return bestOption;
        }
        
        return null;
    }
}

// Initialize the SmartNationalityMatcher
const nationalityMatcher = new SmartNationalityMatcher();

// ============================================
// DYNAMIC FIELD MATCHER CLASS
// ============================================
class DynamicFieldMatcher {
    constructor() {
        this.fieldKnowledge = new Map();
        this.linguisticPatterns = {
            personalInfo: /\b(name|first|last|surname|given|middle|initial|title|mr|ms|mrs)\b/i,
            contact: /\b(email|mail|phone|tel|mobile|cell|fax|contact|reach)\b/i,
            location: /\b(address|street|city|state|country|zip|postal|region|province)\b/i,
            temporal: /\b(date|year|month|day|time|when|deadline|start|end|from|to)\b/i,
            identification: /\b(id|number|code|ssn|passport|license|registration)\b/i,
            academic: /\b(school|university|college|degree|major|gpa|grade|education|study)\b/i,
            professional: /\b(company|employer|job|position|title|work|experience|salary)\b/i,
            financial: /\b(amount|price|cost|fee|payment|account|bank|card)\b/i,
            web: /\b(url|website|link|profile|portfolio|github|linkedin|twitter)\b/i,
            descriptive: /\b(description|summary|bio|about|details|notes|comments|message)\b/i
        };
        this.ngramCache = new Map();
        this.similarityThreshold = 0.6;
        this.requireDirectMatch = true;
    }

    generateNgrams(text, n = 3) {
        if (!text) return new Set();
        const key = `${text}_${n}`;
        if (this.ngramCache.has(key)) return this.ngramCache.get(key);
        
        const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const ngrams = new Set();
        
        for (let i = 0; i <= normalized.length - n; i++) {
            ngrams.add(normalized.substr(i, n));
        }
        
        this.ngramCache.set(key, ngrams);
        return ngrams;
    }

    generateWordFeatures(text) {
        if (!text) return new Set();
        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 1);
        return new Set(words);
    }

    calculateSimilarity(text1, text2) {
        const ngrams1 = this.generateNgrams(text1);
        const ngrams2 = this.generateNgrams(text2);
        const ngramSim = this.jaccardSimilarity(ngrams1, ngrams2);
        
        const words1 = this.generateWordFeatures(text1);
        const words2 = this.generateWordFeatures(text2);
        const wordSim = this.jaccardSimilarity(words1, words2);
        
        return (ngramSim * 0.4 + wordSim * 0.6);
    }

    jaccardSimilarity(set1, set2) {
        if (set1.size === 0 && set2.size === 0) return 1;
        if (set1.size === 0 || set2.size === 0) return 0;
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    matchFieldToProfile(fieldContext, profile) {
        if (!profile || !fieldContext) return { key: null, confidence: 0 };
        
        // First check autocomplete
        if (fieldContext.autocomplete && AUTOCOMPLETE_MAP[fieldContext.autocomplete]) {
            return { key: AUTOCOMPLETE_MAP[fieldContext.autocomplete], confidence: 1.0 };
        }
        
        const fieldText = fieldContext.combinedText.toLowerCase();
        
        // Don't match verification/captcha fields to any profile field
        if (/\b(verification|captcha|security\s?code|challenge|prove|human|robot)\b/i.test(fieldText)) {
            return { key: null, confidence: 0 };
        }
        
        let bestMatch = { key: null, confidence: 0 };
        
        // Check ALL profile fields dynamically
        for (const [profileKey, profileValue] of Object.entries(profile)) {
            // Skip complex objects
            if (typeof profileValue === 'object' && profileValue !== null) continue;
            
            let score = 0;
            const keyLower = profileKey.toLowerCase();
            
            // IMPORTANT: Handle name field confusion
            if (profileKey === 'fullName') {
                // Don't match fullName to fields that are clearly other name types
                if (/\b(middle|preferred|maiden|nick)\s?(name|initial)\b/i.test(fieldText) ||
                    /txt(Middle|Preferred|Maiden|Nick)Name/i.test(fieldText)) {
                    continue; // Skip this entirely
                }
            }
            
            // For specific name fields, give strong boost if it's the right type
            if (profileKey === 'middleName' && 
                (/\b(middle)\s?(name|initial)\b/i.test(fieldText) || /txt(Middle|Mid)Name/i.test(fieldText))) {
                score += 0.7; // Strong boost for correct match
            }
            if (profileKey === 'preferredName' && 
                (/\b(preferred|nick)\s?name\b/i.test(fieldText) || /txt(Preferred|Nick)Name/i.test(fieldText))) {
                score += 0.7;
            }
            if (profileKey === 'maidenName' && 
                (/\b(maiden|birth)\s?name\b/i.test(fieldText) || /txtMaidenName/i.test(fieldText))) {
                score += 0.7;
            }
            
            // Special boost for nationality/citizenship fields
            if (profileKey === 'nationality' && 
                (/\b(nationality|citizenship|citizen)\b/i.test(fieldText))) {
                score += 0.8;
            }
            
            // 1. Exact keyword matches
            if (fieldText.includes(keyLower)) {
                score += 0.3;
            }
            
            // 2. Check for exact word matches in key variations
            const keyWords = keyLower.replace(/([A-Z])/g, ' $1').toLowerCase()
                .split(/[\s_-]+/)
                .filter(w => w.length > 2);
            
            let exactWordMatches = 0;
            for (const word of keyWords) {
                if (word.length > 3 && fieldText.includes(word)) {
                    exactWordMatches++;
                }
            }
            score += exactWordMatches * 0.2;
            
            // 3. Special handling for known confusing cases
            if (profileKey === 'cityAddress' && /\b(college|university|school|education)\b/i.test(fieldText)) {
                score -= 0.5;
            }
            if (profileKey === 'university' && /\b(college|university|school|institution)\b/i.test(fieldText)) {
                score += 0.4;
            }
            
            // Penalize clearly unrelated matches
            if (profileKey === 'gpa' && /\b(verif|captcha|code|security|challenge)\b/i.test(fieldText)) {
                score = 0;
                continue;
            }
            
            // 4. Check key variations
            const keyVariations = this.generateKeyVariations(profileKey);
            for (const variation of keyVariations) {
                if (fieldText.includes(variation.toLowerCase())) {
                    score += 0.15;
                    break;
                }
            }
            
            // 5. Lower weight for similarity scores
            const keySimilarity = this.calculateSimilarity(fieldText, keyLower);
            score += keySimilarity * 0.1;
            
            // 6. Linguistic pattern matching
            for (const [patternType, pattern] of Object.entries(this.linguisticPatterns)) {
                if (pattern.test(fieldText) && pattern.test(keyLower)) {
                    score += 0.05;
                    break;
                }
            }
            
            // 7. Type compatibility bonus
            const typeBoost = this.getTypeCompatibilityScore(fieldContext.type, profileKey, profileValue);
            score += typeBoost;
            
            // 8. Exact match bonuses
            if (fieldContext.name === profileKey || fieldContext.id === profileKey) {
                score += 0.3;
            }
            if (fieldContext.placeholder && fieldContext.placeholder.toLowerCase().includes(keyLower)) {
                score += 0.15;
            }
            
            // Cap score at 1.0
            score = Math.min(score, 1.0);
            
            // Update best match
            if (score > bestMatch.confidence) {
                bestMatch = { key: profileKey, confidence: score };
            }
        }
        
        // Debug logging
        if (DEBUG_MODE && bestMatch.confidence > 0.2) {
            console.log(`[DynamicMatcher] Field "${fieldContext.combinedText.substring(0, 50)}..." best match: ${bestMatch.key} (confidence: ${bestMatch.confidence.toFixed(2)})`);
        }
        
        // Use consistent threshold
        return bestMatch.confidence >= this.similarityThreshold ? bestMatch : { key: null, confidence: bestMatch.confidence };
    }

    generateKeyVariations(key) {
        const variations = new Set();
        variations.add(key.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
        variations.add(key.replace(/_/g, ' '));
        variations.add(key.replace(/-/g, ' '));
        
        const abbreviations = {
            'firstname': 'first name',
            'lastname': 'last name',
            'middlename': 'middle name',
            'fullname': 'full name',
            'preferredname': 'preferred name',
            'maidenname': 'maiden name',
            'phone': 'phone number',
            'altphone': 'alternate phone',
            'email': 'email address',
            'dob': 'date of birth',
            'birthday': 'birth date',
            'address': 'street address',
            'address1': 'address line 1',
            'address2': 'address line 2',
            'zip': 'postal code',
            'postalcode': 'zip code',
            'cityaddress': 'city',
            'countryaddress': 'country',
            'stateaddress': 'state',
            'nationality': 'citizenship',
            'citizenship': 'nationality',
            'sex': 'gender',
            'gender': 'sex',
            'website': 'web site',
            'gpa': 'grade point average',
            'university': 'college',
            'degree': 'education level',
            'major': 'field of study',
            'employer': 'company',
            'jobtitle': 'position',
            'workexperience': 'years of experience'
        };
        
        const lowerKey = key.toLowerCase();
        if (abbreviations[lowerKey]) {
            variations.add(abbreviations[lowerKey]);
        }
        
        return Array.from(variations);
    }

    getTypeCompatibilityScore(inputType, profileKey, profileValue) {
        const compatibilityMap = {
            'email': ['email', 'workemail'],
            'tel': ['phone', 'mobile', 'telephone', 'altphone'],
            'url': ['website', 'linkedin', 'github', 'portfolio'],
            'date': ['birthday', 'date', 'deadline', 'gradyear'],
            'number': ['age', 'year', 'gpa', 'score', 'salary', 'gradyear', 'workexperience', 'yearsexperience']
        };
        
        for (const [type, keywords] of Object.entries(compatibilityMap)) {
            if (inputType === type) {
                for (const keyword of keywords) {
                    if (profileKey.toLowerCase().includes(keyword)) {
                        return 0.2;
                    }
                }
            }
        }
        return 0;
    }

    extractFieldContext(element) {
        const context = {
            label: getLabelTextForInput(element),
            placeholder: element.placeholder || '',
            name: element.name || '',
            id: element.id || '',
            className: element.className || '',
            ariaLabel: element.getAttribute('aria-label') || '',
            autocomplete: element.autocomplete || '',
            type: element.type || ''
        };
        
        context.combinedText = [
            context.label,
            context.placeholder,
            context.name,
            context.id,
            context.ariaLabel
        ].filter(Boolean).join(' ').toLowerCase();
        
        return context;
    }
}

// ============================================
// DYNAMIC OPTION MATCHER CLASS
// ============================================
class DynamicOptionMatcher {
    constructor() {
        this.similarityThreshold = 0.5;
    }
    
    calculateOptionSimilarity(profileValue, optionText, optionValue) {
        if (!profileValue) return 0;
        
        const profileNorm = this.normalize(profileValue);
        const optionTextNorm = this.normalize(optionText);
        const optionValueNorm = this.normalize(optionValue);
        
        // Direct match
        if (profileNorm === optionTextNorm || profileNorm === optionValueNorm) {
            return 1.0;
        }
        
        // Extract meaningful words
        const profileWords = this.extractWords(profileNorm);
        const optionWords = new Set([
            ...this.extractWords(optionTextNorm),
            ...this.extractWords(optionValueNorm)
        ]);
        
        let score = 0;
        
        // Check for word matches
        for (const pWord of profileWords) {
            if (optionWords.has(pWord)) {
                score += 0.3;
            }
            
            // Check semantic equivalents with higher weight
            const equivalents = this.getSemanticEquivalents(pWord);
            for (const equiv of equivalents) {
                if (optionWords.has(equiv)) {
                    score += 0.5;
                    break;
                }
            }
        }
        
        // Special handling for degree levels
        if (this.isDegreeField(profileValue)) {
            const degreeLevel = this.extractDegreeLevel(profileNorm);
            const optionLevel = this.extractDegreeLevel(optionTextNorm + ' ' + optionValueNorm);
            
            if (degreeLevel && optionLevel && degreeLevel === optionLevel) {
                score = Math.max(score, 0.8);
            }
        }
        
        // N-gram similarity for partial matching
        const ngramScore = this.ngramSimilarity(profileNorm, optionTextNorm);
        score += ngramScore * 0.2;
        
        return Math.min(score, 1.0);
    }
    
    isDegreeField(value) {
        const degreeKeywords = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate|degree|bs|ba|ms|ma|mba|msc|bsc)\b/i;
        return degreeKeywords.test(value);
    }
    
    extractDegreeLevel(text) {
        const textLower = text.toLowerCase();
        
        if (/\b(bachelor|bachelors|bs|ba|bsc|b\.s\.|b\.a\.|undergraduate|undergrad|college)\b/.test(textLower)) {
            return 'undergraduate';
        }
        if (/\b(master|masters|ms|ma|mba|msc|m\.s\.|m\.a\.|graduate|grad school|postgraduate)\b/.test(textLower)) {
            return 'graduate';
        }
        if (/\b(phd|ph\.d|doctorate|doctoral|postdoc|post-doc)\b/.test(textLower)) {
            return 'doctorate';
        }
        if (/\b(high school|highschool|secondary|hs|k-12)\b/.test(textLower)) {
            return 'highschool';
        }
        if (/\b(associate|associates|aa|as|a\.a\.|a\.s\.)\b/.test(textLower)) {
            return 'associate';
        }
        
        return null;
    }
    
    normalize(text) {
        return (text || '').toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    extractWords(text) {
        return new Set(text.split(' ').filter(w => w.length > 2));
    }
    
    ngramSimilarity(text1, text2, n = 3) {
        const ngrams1 = this.generateNgrams(text1, n);
        const ngrams2 = this.generateNgrams(text2, n);
        
        if (ngrams1.size === 0 || ngrams2.size === 0) return 0;
        
        const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
        const union = new Set([...ngrams1, ...ngrams2]);
        
        return intersection.size / union.size;
    }
    
    generateNgrams(text, n) {
        const ngrams = new Set();
        const cleaned = text.replace(/\s/g, '');
        for (let i = 0; i <= cleaned.length - n; i++) {
            ngrams.add(cleaned.substr(i, n));
        }
        return ngrams;
    }
    
    getSemanticEquivalents(word) {
        const semanticGroups = [
            // Degree levels
            ['bachelor', 'bachelors', 'undergraduate', 'undergrad', 'college', 'bsc', 'ba', 'bs', 'university'],
            ['master', 'masters', 'graduate', 'grad', 'postgraduate', 'postgrad', 'msc', 'ma', 'ms', 'mba'],
            ['phd', 'doctorate', 'doctoral', 'doctor', 'postdoc', 'research'],
            ['high', 'secondary', 'highschool', 'school', 'k12'],
            ['associate', 'associates', 'community', 'junior'],
            
            // Gender
            ['male', 'man', 'm', 'masculine', 'boy'],
            ['female', 'woman', 'f', 'feminine', 'girl'],
            
            // Other groups
            ['work', 'job', 'employment', 'professional', 'career'],
            ['study', 'education', 'academic', 'school', 'learning'],
            ['current', 'present', 'ongoing', 'active', 'now'],
            ['previous', 'past', 'former', 'prior', 'completed'],
            ['full', 'complete', 'entire', 'whole', 'fulltime'],
            ['part', 'partial', 'incomplete', 'some', 'parttime']
        ];
        
        for (const group of semanticGroups) {
            if (group.includes(word)) {
                return group.filter(w => w !== word);
            }
        }
        
        return [];
    }
    
    findBestOption(select, profileValue, fieldKey) {
        // Check if this is a nationality field and use SmartNationalityMatcher
        if (fieldKey === 'nationality' || 
            (select.name && /nationality|citizenship|citizen/i.test(select.name)) ||
            (select.id && /nationality|citizenship|citizen/i.test(select.id))) {
            
            // Use the SmartNationalityMatcher for nationality fields
            return nationalityMatcher.findBestOption(select, profileValue);
        }
        
        // For non-nationality fields, use the original logic
        let bestOption = null;
        let bestScore = 0;
        
        if (DEBUG_MODE && profileValue) {
            console.log(`[DynamicOptionMatcher] Matching "${profileValue}" against select options:`);
        }
        
        for (const option of select.options) {
            // Skip empty options
            if (!option.value && !option.textContent) continue;
            
            const score = this.calculateOptionSimilarity(
                profileValue,
                option.textContent || option.innerText || '',
                option.value
            );
            
            if (DEBUG_MODE && score > 0) {
                console.log(`  - Option "${option.textContent}" (value: "${option.value}"): score ${score.toFixed(2)}`);
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestOption = option;
            }
        }
        
        if (DEBUG_MODE && profileValue) {
            if (bestOption) {
                console.log(`  ✔ Selected: "${bestOption.textContent}" (score: ${bestScore.toFixed(2)})`);
            } else {
                console.log(`  ✗ No match found (best score: ${bestScore.toFixed(2)}, threshold: ${this.similarityThreshold})`);
            }
        }
        
        // Lower the threshold slightly for better matching
        if (bestScore >= 0.3) {
            return bestOption;
        }
        
        return null;
    }
}

// Initialize the matchers
const dynamicMatcher = new DynamicFieldMatcher();
const optionMatcher = new DynamicOptionMatcher();

// Initialize AWS service (mock by default) - ONLY if aws-service.js is loaded
let awsService = null;
if (typeof FieldMatchingService !== 'undefined') {
    awsService = new FieldMatchingService({ useMockService: true });
    console.log("[AutoFill] AWS service initialized (mock mode)");
}

// ============================================
// ORIGINAL MATCHING UTILITIES (KEPT AS FALLBACK)
// ============================================
function norm(s) {
    return (s || "").toLowerCase().replace(/[_\-:/()]/g, " ").replace(/\s+/g, " ").trim();
}

// UPDATED FIELD_RULES with all possible fields
const FIELD_RULES = [
    { key: "email", any: ["email","e-mail","mail"] },
    { key: "workEmail", any: ["work email","company email","business email"] },
    { key: "phone", any: ["phone","mobile","contact number","telephone","tel","cell"] },
    { key: "altPhone", any: ["alternate phone","secondary phone","other phone","home phone"] },
    { key: "birthday", any: ["birthday","birth date","date of birth","dob","birthdate"] },
    { key: "firstName", any: ["first name","given name","forename","given"] },
    { key: "middleName", any: ["middle name","middle initial","mi"] },
    { key: "lastName",  any: ["last name","surname","family name","family","surname"] },
    { key: "fullName",  any: ["full name","name of applicant","your name","complete name","name"] },
    { key: "preferredName", any: ["preferred name","display name","nickname","goes by"] },
    { key: "maidenName", any: ["maiden name","birth name","previous name"] },
    { key: "address1",  any: ["address","street address","address line 1","street","unit no"] },
    { key: "address2",  any: ["address line 2","apartment","suite","unit"] },
    { key: "cityAddress", any: ["city","town","city address","municipality"] },
    { key: "stateAddress", any: ["state","province","state address","region"] },
    { key: "postalCode", any: ["postal code","zip","zip code","postcode"] },
    { key: "countryAddress", any: ["country","nation","country/region","country address"] },
    { key: "nationality", any: ["nationality","citizenship","citizen of","citizenship status","primary citizenship"] },
    { key: "sex", any: ["sex","gender","male/female","m/f"] },
    { key: "university", any: ["university","college","institution","school","alma mater"] },
    { key: "degree",    any: ["degree","qualification","level of study","education level"] },
    { key: "major",     any: ["major","field of study","specialization","programme","concentration"] },
    { key: "gpa",       any: ["gpa","cgpa","cap","grade point","grade point average"] },
    { key: "gradYear",  any: ["graduation year","year of graduation","grad year","completion year"] },
    { key: "employer",  any: ["employer","company","organization","current employer","workplace"] },
    { key: "jobTitle",  any: ["job title","position","role","designation","title"] },
    { key: "workExperience", any: ["work experience","years of experience","experience","tenure"] },
    { key: "linkedin",  any: ["linkedin","linkedin profile","linkedin url"] },
    { key: "github",    any: ["github","git hub","github profile"] },
    { key: "website",   any: ["website","portfolio","personal site","url","homepage"] },
    { key: "summary",   any: ["summary","bio","about you","profile summary","about me","description"] },
    { key: "languages", any: ["languages","languages spoken","language skills"] },
    { key: "skills",    any: ["skills","technical skills","competencies","expertise"] }
];

// UPDATED AUTOCOMPLETE_MAP
const AUTOCOMPLETE_MAP = {
    "email": "email",
    "tel": "phone",
    "url": "website",
    "given-name": "firstName",
    "additional-name": "middleName",
    "family-name": "lastName",
    "name": "fullName",
    "nickname": "preferredName",
    "organization": "employer",
    "organization-title": "jobTitle",
    "address-line1": "address1",
    "address-line2": "address2",
    "address-level2": "cityAddress",
    "address-level1": "stateAddress",
    "postal-code": "postalCode",
    "country": "countryAddress",
    "country-name": "countryAddress",
    "bday": "birthday",
    "bday-day": "birthDay",
    "bday-month": "birthMonth",
    "bday-year": "birthYear",
    "sex": "sex"
};

function scoreLabelAgainstRule(label, placeholder, nameAttr, idAttr, rule) {
    const hay = norm([label, placeholder, nameAttr, idAttr].filter(Boolean).join(" "));
    
    // Don't try to match verification/captcha fields to any profile field
    if (/\b(verification|verify|captcha|security\s?code|challenge|prove|human|robot)\b/i.test(hay)) {
        return 0;
    }
    
    // Special handling for fullName - don't match if it's clearly a different name type
    if (rule.key === "fullName") {
        const combinedOriginal = [label, placeholder, nameAttr, idAttr].join(' ');
        if (/\b(middle|preferred|maiden|nick)\s?(name|initial)\b/i.test(combinedOriginal) ||
            /txt(Middle|Preferred|Maiden|Nick)Name/i.test(combinedOriginal)) {
            return 0;
        }
    }
    
    // Give higher scores to specific name fields when they match
    if (rule.key === "middleName") {
        const combinedOriginal = [label, placeholder, nameAttr, idAttr].join(' ');
        if (/txt(Middle|Mid)Name/i.test(combinedOriginal)) {
            return 10;
        }
    }
    
    let s = 0;
    for (const cand of rule.any) {
        const c = norm(cand); 
        if (!c) continue;
        if (hay === c) s += 4;
        else if (hay.startsWith(c)) s += 3;
        else if (hay.includes(c)) s += 2;
        const hits = c.split(" ").filter(t => hay.includes(t)).length;
        s += Math.min(2, hits);
    }
    
    // Bonus points for specific field types
    if (/email/.test(hay)) s += 1;
    if (/\b(tel|phone|mobile)\b/.test(hay)) s += 1;
    if (/zip|postal/.test(hay)) s += 1;
    
    return s;
}

function getLabelTextForInput(input) {
    try {
        const id = input.id;
        let t = "";
        if (id) {
            const lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
            if (lbl) t = lbl.innerText || lbl.textContent || "";
        }
        if (!t) {
            const parentLabel = input.closest("label");
            if (parentLabel) t = parentLabel.innerText || parentLabel.textContent || "";
        }
        if (!t) t = input.getAttribute("aria-label") || "";
        return t;
    } catch { return ""; }
}

function isFillable(el) {
    if (el.disabled || el.readOnly) return false;
    if (el instanceof HTMLInputElement) {
        if (["hidden","password","file","submit","button","image","reset"].includes(el.type)) return false;
        return true;
    }
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLSelectElement) return true;
    return false;
}

function nameHintFromAttrs(nameAttr = "", idAttr = "") {
    const s = norm([nameAttr, idAttr].join(" "));
    if (/\b(given|first|fname|first-?name)\b/.test(s)) return "firstName";
    if (/\b(family|last|lname|last-?name|surname)\b/.test(s)) return "lastName";
    if (/\b(middle|mname|middle-?name|mi)\b/.test(s)) return "middleName";
    return null;
}

// ============================================
// ENHANCED FIELD KEY GUESSING WITH DEBUG TRACKING
// ============================================

const DEBUG_MODE = true;

const matchingStats = {
    autocomplete: { attempts: 0, successes: 0 },
    nameHints: { attempts: 0, successes: 0 },
    awsService: { attempts: 0, successes: 0 },
    dynamic: { attempts: 0, successes: 0 },
    rules: { attempts: 0, successes: 0 },
    typeHints: { attempts: 0, successes: 0 },
    failed: { count: 0 }
};

async function guessFieldKey(input, meta, profile) {
    const debugInfo = {
        field: `${meta.name || meta.id || 'unknown'}`,
        label: meta.label,
        matchMethod: null,
        confidence: 0,
        attempts: []
    };

    // 1. Check autocomplete attribute first
    matchingStats.autocomplete.attempts++;
    const ac = (input.getAttribute("autocomplete") || "").trim().toLowerCase();
    if (AUTOCOMPLETE_MAP[ac] !== undefined) {
        matchingStats.autocomplete.successes++;
        debugInfo.matchMethod = 'autocomplete';
        debugInfo.confidence = 1.0;
        
        if (DEBUG_MODE) {
            console.log(`✅ [AutoFill] AUTOCOMPLETE match for "${debugInfo.field}": ${AUTOCOMPLETE_MAP[ac]}`);
        }
        
        return AUTOCOMPLETE_MAP[ac];
    }
    debugInfo.attempts.push({ method: 'autocomplete', result: 'failed' });
    
    // 2. Check for grouped name hints
    matchingStats.nameHints.attempts++;
    const grouped = nameHintFromAttrs(meta.name, meta.id);
    if (grouped) {
        matchingStats.nameHints.successes++;
        debugInfo.matchMethod = 'nameHints';
        debugInfo.confidence = 0.9;
        
        if (DEBUG_MODE) {
            console.log(`✅ [AutoFill] NAME HINTS match for "${debugInfo.field}": ${grouped}`);
        }
        
        return grouped;
    }
    debugInfo.attempts.push({ method: 'nameHints', result: 'failed' });
    
    // 3. Try AWS service if available
    if (awsService && profile && typeof SERVICE_CONFIG !== 'undefined' && !SERVICE_CONFIG.useMockService) {
        matchingStats.awsService.attempts++;
        try {
            const fieldContext = dynamicMatcher.extractFieldContext(input);
            const awsMatch = await awsService.matchField(fieldContext);
            
            if (awsMatch.confidence > 0.8) {
                matchingStats.awsService.successes++;
                debugInfo.matchMethod = 'awsService';
                debugInfo.confidence = awsMatch.confidence;
                
                if (DEBUG_MODE) {
                    console.log(`✅ [AutoFill] AWS SERVICE match for "${debugInfo.field}": ${awsMatch.fieldType} (confidence: ${awsMatch.confidence})`);
                }
                
                return awsMatch.fieldType;
            }
            debugInfo.attempts.push({ method: 'awsService', result: `low confidence (${awsMatch.confidence})` });
        } catch (error) {
            debugInfo.attempts.push({ method: 'awsService', result: `error: ${error.message}` });
        }
    }
    
    // 4. Try dynamic matching if profile is provided
    if (profile) {
        matchingStats.dynamic.attempts++;
        const fieldContext = dynamicMatcher.extractFieldContext(input);
        const match = dynamicMatcher.matchFieldToProfile(fieldContext, profile);
        
        // Trust the class's internal threshold
        if (match.key && match.confidence > 0) {
            matchingStats.dynamic.successes++;
            debugInfo.matchMethod = 'dynamic';
            debugInfo.confidence = match.confidence;
            
            if (DEBUG_MODE) {
                console.log(`✅ [AutoFill] DYNAMIC match for "${debugInfo.field}": ${match.key} (confidence: ${match.confidence.toFixed(2)})`);
            }
            
            return match.key;
        }
        debugInfo.attempts.push({ method: 'dynamic', result: `low confidence (${match.confidence.toFixed(2)})` });
        
        if (DEBUG_MODE && match.confidence > 0.2) {
            console.warn(`⚠️ [AutoFill] NEAR MISS - Dynamic match for "${debugInfo.field}": ${match.key} (confidence: ${match.confidence.toFixed(2)}, threshold: ${dynamicMatcher.similarityThreshold})`);
        }
    }
    
    // 5. Fall back to original rule-based matching
    matchingStats.rules.attempts++;
    let best = { key: null, score: -1 };
    for (const rule of FIELD_RULES) {
        const sc = scoreLabelAgainstRule(meta.label, meta.placeholder, meta.name, meta.id, rule);
        if (sc > best.score) best = { key: rule.key, score: sc };
    }

    if (best.key === "birthday") {
        const s = norm([meta.label, meta.placeholder, meta.name, meta.id].join(" "));
        if (/\b(year|yyyy|yy)\b/.test(s)) best.key = "birthYear";
        else if (/\b(month|mm)\b/.test(s)) best.key = "birthMonth";
        else if (/\b(day|dd)\b/.test(s)) best.key = "birthDay";
    }

    // Use a higher threshold for rules matching to reduce false positives
    if (best.score >= 4) {
        matchingStats.rules.successes++;
        debugInfo.matchMethod = 'rules';
        debugInfo.confidence = best.score / 10;
        
        if (DEBUG_MODE) {
            console.log(`⚠️ [AutoFill] FALLBACK RULES match for "${debugInfo.field}": ${best.key} (score: ${best.score})`);
        }
        
        return best.key;
    }
    debugInfo.attempts.push({ method: 'rules', result: `low score (${best.score})` });

    // 6. Last resort: input type hints
    matchingStats.typeHints.attempts++;
    let typeMatch = null;
    if (input.type === "email") typeMatch = "email";
    else if (input.type === "tel") typeMatch = "phone";
    else if (input.type === "url") typeMatch = "website";
    
    if (typeMatch) {
        matchingStats.typeHints.successes++;
        debugInfo.matchMethod = 'typeHints';
        debugInfo.confidence = 0.3;
        
        if (DEBUG_MODE) {
            console.log(`⚠️ [AutoFill] TYPE HINT match for "${debugInfo.field}": ${typeMatch} (based on input type="${input.type}")`);
        }
        
        return typeMatch;
    }
    
    matchingStats.failed.count++;
    
    if (DEBUG_MODE) {
        console.log(`❌ [AutoFill] NO MATCH for field:`, {
            field: debugInfo.field,
            label: meta.label,
            placeholder: meta.placeholder,
            attempts: debugInfo.attempts
        });
    }
    
    return null;
}

// ============================================
// STATISTICS REPORTING
// ============================================

function reportMatchingStatistics() {
    console.group('📊 [AutoFill] Matching Statistics');
    
    const total = Object.values(matchingStats).reduce((sum, stat) => 
        sum + (stat.attempts || stat.count || 0), 0);
    
    console.table({
        'Autocomplete': {
            'Attempts': matchingStats.autocomplete.attempts,
            'Successes': matchingStats.autocomplete.successes,
            'Success Rate': matchingStats.autocomplete.attempts > 0 
                ? `${(matchingStats.autocomplete.successes / matchingStats.autocomplete.attempts * 100).toFixed(1)}%`
                : 'N/A'
        },
        'Name Hints': {
            'Attempts': matchingStats.nameHints.attempts,
            'Successes': matchingStats.nameHints.successes,
            'Success Rate': matchingStats.nameHints.attempts > 0
                ? `${(matchingStats.nameHints.successes / matchingStats.nameHints.attempts * 100).toFixed(1)}%`
                : 'N/A'
        },
        'Dynamic Matcher': {
            'Attempts': matchingStats.dynamic.attempts,
            'Successes': matchingStats.dynamic.successes,
            'Success Rate': matchingStats.dynamic.attempts > 0
                ? `${(matchingStats.dynamic.successes / matchingStats.dynamic.attempts * 100).toFixed(1)}%`
                : 'N/A'
        },
        'Rule-Based (Fallback)': {
            'Attempts': matchingStats.rules.attempts,
            'Successes': matchingStats.rules.successes,
            'Success Rate': matchingStats.rules.attempts > 0
                ? `${(matchingStats.rules.successes / matchingStats.rules.attempts * 100).toFixed(1)}%`
                : 'N/A'
        },
        'Type Hints': {
            'Attempts': matchingStats.typeHints.attempts,
            'Successes': matchingStats.typeHints.successes,
            'Success Rate': matchingStats.typeHints.attempts > 0
                ? `${(matchingStats.typeHints.successes / matchingStats.typeHints.attempts * 100).toFixed(1)}%`
                : 'N/A'
        },
        'Failed': {
            'Count': matchingStats.failed.count,
            'Failure Rate': total > 0 ? `${(matchingStats.failed.count / total * 100).toFixed(1)}%` : 'N/A'
        }
    });
    
    const dynamicSuccess = matchingStats.dynamic.attempts > 0
        ? (matchingStats.dynamic.successes / matchingStats.dynamic.attempts * 100).toFixed(1)
        : 0;
    
    const rulesSuccess = matchingStats.rules.attempts > 0
        ? (matchingStats.rules.successes / matchingStats.rules.attempts * 100).toFixed(1)
        : 0;
    
    console.log(`🎯 Dynamic Matcher Success Rate: ${dynamicSuccess}%`);
    console.log(`📋 Rules Fallback Success Rate: ${rulesSuccess}%`);
    
    if (matchingStats.rules.successes > 0) {
        console.warn(`⚠️ Rules fallback was used ${matchingStats.rules.successes} times - Dynamic matcher needs improvement for these cases`);
    }
    
    if (matchingStats.dynamic.successes > matchingStats.rules.successes) {
        console.log(`✅ Dynamic matcher is outperforming rules! Consider removing fallback in next version.`);
    }
    
    console.groupEnd();
}

// ============================================
// ADD DEBUG COMMANDS
// ============================================

window.autofillDebug = {
    stats: () => reportMatchingStatistics(),
    setDebugMode: (enabled) => { 
        window.DEBUG_MODE = enabled;
        console.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
};

console.log('👁 [AutoFill] Debug mode enabled. Use window.autofillDebug.stats() to see statistics.');

// ============================================
// VALUE SETTERS
// ============================================
function fireInputEvents(el) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
}

function setTextLike(el, value) {
    if (value == null || value === "") return false;
    const prev = el.value;
    el.value = value;
    fireInputEvents(el);
    return el.value !== prev;
}

function setRadioButton(input, value) {
    if (!value || input.type !== 'radio') return false;
    
    // Get all radio buttons with the same name
    const radioGroup = document.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
    
    let matched = false;
    for (const radio of radioGroup) {
        // Check various value matching patterns
        const radioValue = radio.value.toLowerCase();
        const targetValue = value.toLowerCase();
        
        // Direct match
        if (radioValue === targetValue) {
            radio.checked = true;
            fireInputEvents(radio);
            matched = true;
            if (DEBUG_MODE) console.log(`✅ Radio button matched by value: ${radioValue}`);
            break;
        }
        
        // Special case for gender/sex fields
        if (targetValue === 'male' && (radioValue === 'm' || radioValue === 'male' || radioValue === 'man')) {
            radio.checked = true;
            fireInputEvents(radio);
            matched = true;
            if (DEBUG_MODE) console.log(`✅ Radio button matched male: ${radioValue}`);
            break;
        }
        if (targetValue === 'female' && (radioValue === 'f' || radioValue === 'female' || radioValue === 'woman')) {
            radio.checked = true;
            fireInputEvents(radio);
            matched = true;
            if (DEBUG_MODE) console.log(`✅ Radio button matched female: ${radioValue}`);
            break;
        }
        
        // Check if the label text matches
        const label = getLabelTextForInput(radio).toLowerCase();
        if (label && (label === targetValue || label.includes(targetValue) || targetValue.includes(label))) {
            radio.checked = true;
            fireInputEvents(radio);
            matched = true;
            if (DEBUG_MODE) console.log(`✅ Radio button matched by label: ${label}`);
            break;
        }
    }
    
    if (!matched && DEBUG_MODE) {
        console.warn(`❌ Could not match radio button for value: ${value}`);
    }
    
    return matched;
}

function setCheckbox(input, value) {
    if (input.type !== 'checkbox') return false;
    
    // Handle boolean-like values
    const isChecked = value === true || 
                     value === 'true' || 
                     value === '1' || 
                     value === 'yes' || 
                     value === 'on' ||
                     value === 'checked';
    
    input.checked = isChecked;
    fireInputEvents(input);
    return true;
}

function setSelectByTextOrValue(select, desiredRaw, fieldKey) {
    if (!desiredRaw) return false;
    
    // Check if this is a nationality/citizenship field
    const isNationalityField = fieldKey === 'nationality' || 
                              (select.name && /nationality|citizenship|citizen/i.test(select.name)) ||
                              (select.id && /nationality|citizenship|citizen/i.test(select.id));
    
    if (isNationalityField && DEBUG_MODE) {
        console.log(`🌍 [AutoFill] Attempting to match nationality "${desiredRaw}" in select field`);
    }
    
    // Use SmartNationalityMatcher for nationality fields
    if (isNationalityField) {
        const match = nationalityMatcher.findBestOption(select, desiredRaw);
        if (match) {
            select.value = match.value;
            fireInputEvents(select);
            return true;
        }
    }
    
    // For non-nationality fields, use DynamicOptionMatcher
    const dynamicMatch = optionMatcher.findBestOption(select, desiredRaw, fieldKey);
    if (dynamicMatch) {
        select.value = dynamicMatch.value;
        fireInputEvents(select);
        if (DEBUG_MODE) {
            console.log(`✅ [AutoFill] DYNAMIC OPTION match: "${desiredRaw}" → "${dynamicMatch.textContent}"`);
        }
        return true;
    }
    
    // Fallback to original matching logic (simplified)
    const desired = norm(desiredRaw);

    let best = null, bestScore = -1;
    for (const opt of Array.from(select.options)) {
        const val = norm(opt.value);
        const txt = norm(opt.textContent || "");
        const candidates = [val, txt];

        const scores = candidates.map(h => {
            if (!h) return -1;
            if (h === desired) return 5;
            if (h.startsWith(desired)) return 4;
            if (h.includes(desired)) return 3;
            if (desired && h.includes(desired.split(" ")[0])) return 2;
            return -1;
        });
        const s = Math.max(...scores);
        if (s > bestScore) { bestScore = s; best = opt; }
    }
    
    if (best && bestScore >= 3) {
        select.value = best.value;
        fireInputEvents(select);
        return true;
    }
    
    return false;
}

function setDateInput(input, key, profile) {
    if (key === "gradYear" && profile.gradYear) {
        const y = String(profile.gradYear).padStart(4, "0");
        const v = `${y}-06-01`;
        input.value = v;
        fireInputEvents(input);
        return true;
    }
    if (key === "birthday" && profile.birthday) {
        input.value = profile.birthday;
        fireInputEvents(input);
        return true;
    }
    return false;
}

function decorate(el, ok) {
    el.setAttribute("data-af-filled", ok ? "1" : "0");
    el.style.outline = ok ? "2px solid #26a269" : "2px dashed #c01c28";
    el.style.outlineOffset = "2px";
}

// ============================================
// PROFILE LOADER
// ============================================
async function getUserIdentifier() {
    const storage = await chrome.storage.local.get(['currentUserId']);
    return storage.currentUserId || 'default-user';
}

async function loadProfile() {
    console.log('[AutoFill] Loading profile...');
    
    const settings = await chrome.storage.local.get(['syncWithAWS', 'lastSyncTime']);
    const shouldSync = settings.syncWithAWS !== false;
    const lastSync = settings.lastSyncTime || 0;
    const hoursSinceSync = (Date.now() - lastSync) / (1000 * 60 * 60);
    
    if (shouldSync && hoursSinceSync > 1 && typeof StorageService !== 'undefined') {
        try {
            console.log('[AutoFill] Fetching latest profile from AWS...');
            const storageService = new StorageService(SERVICE_CONFIG);
            const userId = await getUserIdentifier();
            const remoteProfile = await storageService.loadProfile(userId);
            
            if (remoteProfile && remoteProfile.data) {
                console.log('[AutoFill] Successfully fetched profile from AWS');
                
                await chrome.storage.local.set({ 
                    af_profile: remoteProfile.data,
                    lastSyncTime: Date.now(),
                    lastSyncSource: 'aws'
                });
                
                return remoteProfile.data;
            }
        } catch (error) {
            console.warn('[AutoFill] Could not fetch from AWS:', error);
        }
    }
    
    const local = await chrome.storage.local.get(["af_profile", "af_profile_enc"]);
    
    if (local.af_profile_enc) {
        let pass = "";
        try { 
            const s = await chrome.storage.session.get("af_passphrase"); 
            pass = s.af_passphrase || ""; 
        } catch {}
        
        if (!pass) { 
            console.warn("[AutoFill] Encrypted profile present but locked"); 
            return null; 
        }
        
        try { 
            return await AF_CRYPTO.decryptJSON(local.af_profile_enc, pass); 
        } catch (e) { 
            console.warn("[AutoFill] Decryption failed:", e?.message); 
            return null; 
        }
    }
    
    return local.af_profile || null;
}

// ============================================
// DATE FIELD DETECTION AND HANDLING
// ============================================
function detectDateFieldType(element, meta) {
    const combinedText = [
        meta.label,
        meta.placeholder,
        meta.name,
        meta.id,
        element.className || ''
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (/\b(day|dd|date)\b/.test(combinedText) && 
        !/\b(month|mm|year|yyyy|yy)\b/.test(combinedText)) {
        if (isPartOfDateGroup(element)) return "birthDay";
        if (/\b(birth|dob|born)\b/.test(combinedText)) return "birthDay";
    }
    
    if (/\b(month|mm)\b/.test(combinedText) && 
        !/\b(day|dd|year|yyyy|yy)\b/.test(combinedText)) {
        if (isPartOfDateGroup(element)) return "birthMonth";
        if (/\b(birth|dob|born)\b/.test(combinedText)) return "birthMonth";
    }
    
    if (/\b(year|yyyy|yy)\b/.test(combinedText) && 
        !/\b(day|dd|month|mm)\b/.test(combinedText)) {
        if (isPartOfDateGroup(element)) return "birthYear";
        if (/\b(birth|dob|born|grad)\b/.test(combinedText)) {
            return /\b(grad|graduation|complete)\b/.test(combinedText) ? "gradYear" : "birthYear";
        }
    }
    
    return null;
}

function isPartOfDateGroup(element) {
    const parent = element.closest('div, fieldset, section, tr');
    if (!parent) return false;
    
    const siblings = parent.querySelectorAll('input, select');
    let dateFieldCount = 0;
    
    for (const sibling of siblings) {
        const text = [
            sibling.name || '',
            sibling.id || '',
            sibling.className || '',
            getLabelTextForInput(sibling)
        ].join(' ').toLowerCase();
        
        if (/\b(day|month|year|dd|mm|yyyy)\b/.test(text)) {
            dateFieldCount++;
        }
    }
    
    return dateFieldCount >= 2;
}

function fillDateSelect(select, value, type) {
    if (!value) return false;
    
    if (type === 'day') {
        const dayNum = parseInt(value, 10);
        const variations = [
            String(dayNum),
            String(dayNum).padStart(2, '0'),
            `${dayNum}${getOrdinalSuffix(dayNum)}`
        ];
        
        for (const variant of variations) {
            if (setSelectByTextOrValue(select, variant)) return true;
        }
    } else if (type === 'month') {
        const monthNum = parseInt(value, 10);
        if (isNaN(monthNum)) return false;
        
        const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        
        const variations = [
            String(monthNum),
            String(monthNum).padStart(2, '0'),
            MONTHS_FULL[monthNum - 1],
            MONTHS_SHORT[monthNum - 1],
            `${monthNum} - ${MONTHS_FULL[monthNum - 1]}`,
            `${String(monthNum).padStart(2, '0')} - ${MONTHS_FULL[monthNum - 1]}`
        ];
        
        for (const variant of variations) {
            if (setSelectByTextOrValue(select, variant)) return true;
        }
    } else if (type === 'year') {
        const yearStr = String(value);
        const variations = [
            yearStr,
            yearStr.slice(-2)
        ];
        
        for (const variant of variations) {
            if (setSelectByTextOrValue(select, variant)) return true;
        }
    }
    
    return false;
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// ============================================
// MAIN FILL FUNCTION
// ============================================
async function fillNow() {
    const profile = await loadProfile();
    if (!profile) { console.info("[AutoFill] No usable profile (missing/locked)."); return; }

    const elements = Array.from(document.querySelectorAll("input, textarea, select"));
    let filled = 0;
    
    const filledDateComponents = new Set();
    const processedRadioGroups = new Set();

    for (const el of elements) {
        if (!isFillable(el)) continue;

        const meta = {
            label: getLabelTextForInput(el),
            placeholder: el.placeholder || "",
            name: el.name || "",
            id: el.id || ""
        };
        
        // Extract field context for better matching
        const fieldContext = dynamicMatcher.extractFieldContext(el);
        
        let key = detectDateFieldType(el, meta);
        
        if (!key) {
            key = await guessFieldKey(el, meta, profile);
        }
        
        if (!key) continue; // No match found at all
        
        // Skip if we've already processed this radio group
        if (el.type === 'radio' && el.name) {
            if (processedRadioGroups.has(el.name)) continue;
            processedRadioGroups.add(el.name);
        }
        
        if (key && ['birthDay', 'birthMonth', 'birthYear'].includes(key)) {
            if (filledDateComponents.has(key)) continue;
            filledDateComponents.add(key);
        }

        let value = profile[key];

        if ((key === "birthYear" || key === "birthMonth" || key === "birthDay") && profile.birthday) {
            const [y, m, d] = profile.birthday.split("-");
            if (key === "birthYear") value = y;
            if (key === "birthMonth") value = String(parseInt(m, 10));
            if (key === "birthDay") value = String(parseInt(d, 10));
        }

        if ((key === "firstName" || key === "lastName") && !value && profile.fullName) {
            const parts = profile.fullName.trim().split(/\s+/);
            if (parts.length >= 2) {
                value = key === "firstName" ? parts.slice(0, -1).join(" ") : parts.at(-1);
            }
        }

        // If we identified the field but have no data for it, mark it with red border
        if (!value || value === '') {
            if (DEBUG_MODE) {
                console.log(`⭕️ [AutoFill] Identified field "${key}" but no data available - skipping`);
            }
            // Only mark with red border if we're very confident this is the right field
            if (key && ['firstName', 'lastName', 'middleName', 'preferredName', 'maidenName'].includes(key)) {
                // For name fields, only mark if we're sure it's the right type
                const fieldText = fieldContext.combinedText.toLowerCase();
                let shouldMark = false;
                
                if (key === 'middleName' && /\b(middle)\s?(name|initial)\b/i.test(fieldText)) {
                    shouldMark = true;
                } else if (key === 'preferredName' && /\b(preferred|nick)\s?name\b/i.test(fieldText)) {
                    shouldMark = true;
                } else if (key === 'maidenName' && /\b(maiden|birth)\s?name\b/i.test(fieldText)) {
                    shouldMark = true;
                } else if (key === 'firstName' && /\b(first)\s?name\b/i.test(fieldText)) {
                    shouldMark = true;
                } else if (key === 'lastName' && /\b(last|sur)\s?name\b/i.test(fieldText)) {
                    shouldMark = true;
                }
                
                if (shouldMark) {
                    decorate(el, false);
                }
            }
            continue;
        }

        let ok = false;
        if (el instanceof HTMLSelectElement) {
            if (key === "birthDay" && profile.birthday) {
                const [, , d] = profile.birthday.split("-");
                ok = fillDateSelect(el, d, 'day');
            } else if (key === "birthMonth" && profile.birthday) {
                const [, m] = profile.birthday.split("-");
                ok = fillDateSelect(el, m, 'month');
            } else if (key === "birthYear" && profile.birthday) {
                const [y] = profile.birthday.split("-");
                ok = fillDateSelect(el, y, 'year');
            } else if (key === "gradYear" && profile.gradYear) {
                ok = fillDateSelect(el, profile.gradYear, 'year');
            } else {
                // Pass the field key to help with nationality matching
                ok = setSelectByTextOrValue(el, value, key);
            }
        } else if (el instanceof HTMLInputElement) {
            // Handle radio buttons
            if (el.type === "radio") {
                ok = setRadioButton(el, value);
                if (ok) {
                    filled++;
                    if (DEBUG_MODE) console.log(`✅ Filled radio group: ${el.name} = ${value}`);
                }
                continue; // Skip the normal decorate/count logic
            }
            // Handle checkboxes
            else if (el.type === "checkbox") {
                ok = setCheckbox(el, value);
            }
            // Handle date inputs
            else if (el.type === "date") {
                ok = setDateInput(el, key, profile);
                if (!ok && value && /^\d{4}-\d{2}-\d{2}$/.test(value)) ok = setTextLike(el, value);
            } else if (el.type === "number" || el.type === "text") {
                if (key === "birthDay" && profile.birthday) {
                    const [, , d] = profile.birthday.split("-");
                    ok = setTextLike(el, String(parseInt(d, 10)));
                } else if (key === "birthMonth" && profile.birthday) {
                    const [, m] = profile.birthday.split("-");
                    ok = setTextLike(el, String(parseInt(m, 10)));
                } else if (key === "birthYear" && profile.birthday) {
                    const [y] = profile.birthday.split("-");
                    ok = setTextLike(el, y);
                } else {
                    ok = setTextLike(el, value);
                }
            } else {
                ok = setTextLike(el, value);
            }
        } else {
            ok = setTextLike(el, value);
        }
        
        decorate(el, ok);
        if (ok) filled++;
    }

    console.info(`[AutoFill] Filled ${filled} fields.`);
}

// ============================================
// TEST LOGGER
// ============================================
function listFillableFields() {
    const elements = Array.from(document.querySelectorAll("input, textarea, select"));
    console.group("[AutoFill] Captured fillable fields:");
    elements.forEach(async el => {
        const fillable = isFillable(el);
        const meta = {
            label: getLabelTextForInput(el),
            placeholder: el.placeholder || "",
            name: el.name || "",
            id: el.id || ""
        };
        const profile = await loadProfile();
        const key = await guessFieldKey(el, meta, profile);
        console.log({
            tag: el.tagName.toLowerCase(),
            type: el instanceof HTMLInputElement ? el.type : (el instanceof HTMLSelectElement ? "select" : "textarea"),
            fillable,
            label: meta.label,
            placeholder: meta.placeholder,
            name: meta.name,
            id: meta.id,
            guessedKey: key
        });
    });
    console.groupEnd();
}

// ============================================
// INITIALIZATION
// ============================================

chrome.storage.local.get(['af_field_knowledge'], (result) => {
    if (result.af_field_knowledge) {
        try {
            dynamicMatcher.fieldKnowledge = new Map(result.af_field_knowledge);
            console.debug("[AutoFill] Loaded field knowledge");
        } catch (e) {
            console.warn("[AutoFill] Failed to load field knowledge:", e);
        }
    }
});

setInterval(() => {
    const knowledge = Array.from(dynamicMatcher.fieldKnowledge.entries());
    chrome.storage.local.set({ af_field_knowledge: knowledge });
}, 30000);

chrome.storage.local.get(["af_autoFillEnabled"], ({ af_autoFillEnabled }) => {
    if (af_autoFillEnabled) fillNow();
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "AF_FILL_NOW") fillNow();
    if (msg?.type === "AF_LIST_FIELDS") listFillableFields();
});

})(); // This closes the main IIFE that wraps the entire content script