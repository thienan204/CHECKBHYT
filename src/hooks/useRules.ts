import { useState, useEffect } from 'react';
import { ValidationRule, DEFAULT_RULES } from '@/lib/validation';

const STORAGE_KEY = 'validationRules';

export function useRules() {
    const [rules, setRules] = useState<ValidationRule[]>(DEFAULT_RULES);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from storage on mount
    useEffect(() => {
        const loadRules = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setRules(parsed);
                    }
                }
            } catch (error) {
                console.error('Failed to load rules:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadRules();

        // Listen for storage events (sync across tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadRules();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const saveRules = (newRules: ValidationRule[]) => {
        setRules(newRules);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
            // Dispatch a custom event for same-tab sync if components are mounted efficiently without page reload
            window.dispatchEvent(new Event('local-rules-update'));
        } catch (error) {
            console.error('Failed to save rules:', error);
        }
    };

    // Listen for custom local updates (same tab)
    useEffect(() => {
        const handleLocalUpdate = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRules(JSON.parse(stored));
            }
        };

        window.addEventListener('local-rules-update', handleLocalUpdate);
        return () => window.removeEventListener('local-rules-update', handleLocalUpdate);
    }, []);

    return { rules, saveRules, isLoaded };
}
