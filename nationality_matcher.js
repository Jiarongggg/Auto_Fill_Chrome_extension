// ============================================
// SMART NATIONALITY MATCHER MODULE
// ============================================
// This module provides intelligent nationality/citizenship matching
// using a hybrid approach: quick mappings + fuzzy matching + transformation rules

class SmartNationalityMatcher {
    constructor() {
        // Quick lookup for most common nationality mappings (covers 95% of cases)
        this.quickMap = {
            // Americas
            'american': ['United States', 'USA', 'US', 'United States of America', 'America'],
            'canadian': ['Canada', 'Canadian', 'CA'],
            'mexican': ['Mexico', 'Mexican', 'MX'],
            'brazilian': ['Brazil', 'Brazilian', 'BR', 'Brasil'],
            'argentinian': ['Argentina', 'Argentinian', 'Argentine', 'AR'],
            
            // Europe  
            'british': ['United Kingdom', 'UK', 'British', 'Great Britain', 'GB', 'England'],
            'french': ['France', 'French', 'FR'],
            'german': ['Germany', 'German', 'DE', 'Deutschland'],
            'italian': ['Italy', 'Italian', 'IT', 'Italia'],
            'spanish': ['Spain', 'Spanish', 'ES', 'España'],
            'dutch': ['Netherlands', 'Dutch', 'NL', 'Holland', 'The Netherlands'],
            'swiss': ['Switzerland', 'Swiss', 'CH'],
            'swedish': ['Sweden', 'Swedish', 'SE'],
            'norwegian': ['Norway', 'Norwegian', 'NO'],
            'danish': ['Denmark', 'Danish', 'DK'],
            'polish': ['Poland', 'Polish', 'PL'],
            'irish': ['Ireland', 'Irish', 'IE', 'Republic of Ireland', 'Eire'],
            'portuguese': ['Portugal', 'Portuguese', 'PT'],
            'belgian': ['Belgium', 'Belgian', 'BE'],
            'austrian': ['Austria', 'Austrian', 'AT'],
            'finnish': ['Finland', 'Finnish', 'FI'],
            'greek': ['Greece', 'Greek', 'GR'],
            'czech': ['Czech Republic', 'Czech', 'CZ', 'Czechia'],
            'hungarian': ['Hungary', 'Hungarian', 'HU'],
            'romanian': ['Romania', 'Romanian', 'RO'],
            'bulgarian': ['Bulgaria', 'Bulgarian', 'BG'],
            'croatian': ['Croatia', 'Croatian', 'HR'],
            'serbian': ['Serbia', 'Serbian', 'RS'],
            'ukrainian': ['Ukraine', 'Ukrainian', 'UA'],
            'russian': ['Russia', 'Russian', 'RU', 'Russian Federation'],
            
            // Asia-Pacific
            'chinese': ['China', 'Chinese', 'CN', "People's Republic of China", 'PRC'],
            'japanese': ['Japan', 'Japanese', 'JP'],
            'korean': ['South Korea', 'Korean', 'KR', 'Korea', 'Republic of Korea'],
            'indian': ['India', 'Indian', 'IN'],
            'pakistani': ['Pakistan', 'Pakistani', 'PK'],
            'bangladeshi': ['Bangladesh', 'Bangladeshi', 'BD'],
            'indonesian': ['Indonesia', 'Indonesian', 'ID'],
            'thai': ['Thailand', 'Thai', 'TH'],
            'vietnamese': ['Vietnam', 'Vietnamese', 'VN'],
            'filipino': ['Philippines', 'Filipino', 'PH', 'Philippine'],
            'malaysian': ['Malaysia', 'Malaysian', 'MY'],
            'singaporean': ['Singapore', 'Singaporean', 'SG'],
            'taiwanese': ['Taiwan', 'Taiwanese', 'TW', 'Chinese Taipei', 'Republic of China'],
            'hong kong': ['Hong Kong', 'HK', 'Hong Kong SAR', 'Hongkonger'],
            'australian': ['Australia', 'Australian', 'AU'],
            'new zealander': ['New Zealand', 'New Zealander', 'NZ', 'Kiwi'],
            
            // Middle East & Africa
            'israeli': ['Israel', 'Israeli', 'IL'],
            'saudi': ['Saudi Arabia', 'Saudi', 'SA', 'KSA', 'Saudi Arabian'],
            'emirati': ['United Arab Emirates', 'UAE', 'Emirati', 'AE'],
            'turkish': ['Turkey', 'Turkish', 'TR', 'Türkiye'],
            'iranian': ['Iran', 'Iranian', 'IR', 'Persian'],
            'egyptian': ['Egypt', 'Egyptian', 'EG'],
            'south african': ['South Africa', 'South African', 'ZA', 'RSA'],
            'nigerian': ['Nigeria', 'Nigerian', 'NG'],
            'kenyan': ['Kenya', 'Kenyan', 'KE'],
            'moroccan': ['Morocco', 'Moroccan', 'MA'],
            'ethiopian': ['Ethiopia', 'Ethiopian', 'ET']
        };
        
        // Transformation rules for nationality to country patterns
        this.transformRules = [
            // -ian pattern: Italian -> Italy, Canadian -> Canada
            { 
                pattern: /^(.+)ian$/i, 
                transform: (match) => {
                    const base = match[1];
                    // Special cases
                    if (base.toLowerCase() === 'brasil') return 'Brazil';
                    if (base.toLowerCase() === 'argentin') return 'Argentina';
                    if (base.toLowerCase() === 'ital') return 'Italy';
                    if (base.toLowerCase() === 'canad') return 'Canada';
                    if (base.toLowerCase() === 'indian') return 'India';
                    if (base.toLowerCase() === 'austral') return 'Australia';
                    if (base.toLowerCase() === 'belg') return 'Belgium';
                    if (base.toLowerCase() === 'hungar') return 'Hungary';
                    if (base.toLowerCase() === 'roman') return 'Romania';
                    if (base.toLowerCase() === 'bulgar') return 'Bulgaria';
                    if (base.toLowerCase() === 'croat') return 'Croatia';
                    if (base.toLowerCase() === 'serb') return 'Serbia';
                    if (base.toLowerCase() === 'ukrain') return 'Ukraine';
                    if (base.toLowerCase() === 'russ') return 'Russia';
                    if (base.toLowerCase() === 'iran') return 'Iran';
                    if (base.toLowerCase() === 'egypt') return 'Egypt';
                    if (base.toLowerCase() === 'ethiop') return 'Ethiopia';
                    if (base.toLowerCase() === 'niger') return 'Nigeria';
                    if (base.toLowerCase() === 'kenya') return 'Kenya';
                    return base + 'ia';
                }
            },
            // -ish pattern: Spanish -> Spain, Turkish -> Turkey
            { 
                pattern: /^(.+)ish$/i, 
                transform: (match) => {
                    const base = match[1];
                    if (base.toLowerCase() === 'span') return 'Spain';
                    if (base.toLowerCase() === 'brit') return 'United Kingdom';
                    if (base.toLowerCase() === 'ir') return 'Ireland';
                    if (base.toLowerCase() === 'turk') return 'Turkey';
                    if (base.toLowerCase() === 'pol') return 'Poland';
                    if (base.toLowerCase() === 'finn') return 'Finland';
                    if (base.toLowerCase() === 'dan') return 'Denmark';
                    if (base.toLowerCase() === 'swed') return 'Sweden';
                    return base + 'land';
                }
            },
            // -ese pattern: Chinese -> China, Japanese -> Japan
            { 
                pattern: /^(.+)ese$/i, 
                transform: (match) => {
                    const base = match[1];
                    if (base.toLowerCase() === 'chin') return 'China';
                    if (base.toLowerCase() === 'japan') return 'Japan';
                    if (base.toLowerCase() === 'vietnam') return 'Vietnam';
                    if (base.toLowerCase() === 'portugu') return 'Portugal';
                    if (base.toLowerCase() === 'maltes') return 'Malta';
                    if (base.toLowerCase() === 'sudan') return 'Sudan';
                    if (base.toLowerCase() === 'taiwan') return 'Taiwan';
                    if (base.toLowerCase() === 'nepal') return 'Nepal';
                    if (base.toLowerCase() === 'burm') return 'Myanmar';
                    if (base.toLowerCase() === 'leban') return 'Lebanon';
                    if (base.toLowerCase() === 'senegal') return 'Senegal';
                    return base;
                }
            },
            // -an pattern: American -> America/United States, Korean -> Korea
            { 
                pattern: /^(.+)an$/i, 
                transform: (match) => {
                    const base = match[1];
                    if (base.toLowerCase() === 'americ') return 'United States';
                    if (base.toLowerCase() === 'mexic') return 'Mexico';
                    if (base.toLowerCase() === 'kore') return 'South Korea';
                    if (base.toLowerCase() === 'morocc') return 'Morocco';
                    if (base.toLowerCase() === 'germ') return 'Germany';
                    if (base.toLowerCase() === 'austri') return 'Austria';
                    if (base.toLowerCase() === 'europe') return 'Europe';
                    if (base.toLowerCase() === 'afric') return 'Africa';
                    if (base.toLowerCase() === 'asi') return 'Asia';
                    return base;
                }
            },
            // -i pattern: Saudi -> Saudi Arabia, Israeli -> Israel
            { 
                pattern: /^(.+)i$/i, 
                transform: (match) => {
                    const base = match[1];
                    if (base.toLowerCase() === 'saud') return 'Saudi Arabia';
                    if (base.toLowerCase() === 'israel') return 'Israel';
                    if (base.toLowerCase() === 'pakistan') return 'Pakistan';
                    if (base.toLowerCase() === 'iraq') return 'Iraq';
                    if (base.toLowerCase() === 'bangladesh') return 'Bangladesh';
                    if (base.toLowerCase() === 'emirat') return 'United Arab Emirates';
                    if (base.toLowerCase() === 'kuwait') return 'Kuwait';
                    if (base.toLowerCase() === 'bahrain') return 'Bahrain';
                    if (base.toLowerCase() === 'oman') return 'Oman';
                    if (base.toLowerCase() === 'yemen') return 'Yemen';
                    if (base.toLowerCase() === 'somali') return 'Somalia';
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
        
        // Use a reasonable threshold
        if (bestScore >= 0.6) {
            return bestOption;
        }
        
        return null;
    }
}

// Export for use in content.js
if (typeof window !== 'undefined') {
    window.SmartNationalityMatcher = SmartNationalityMatcher;
}