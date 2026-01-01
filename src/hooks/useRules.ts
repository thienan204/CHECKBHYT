import { useState, useEffect } from 'react';
import { ValidationRule, DEFAULT_RULES } from '@/lib/validation';

const STORAGE_KEY = 'validationRules';

export function useRules() {
    const [rules, setRules] = useState<ValidationRule[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const saveRules = async (newRules: ValidationRule[]) => {
        // Optimistic update
        setRules(newRules);
        try {
            await fetch('/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRules)
            });
        } catch (error) {
            console.error('Failed to save rules:', error);
        }
    };

    // Load from API on mount
    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await fetch('/api/rules');
                if (res.ok) {
                    const dbRules = await res.json();

                    // MIGRATION LOCIG: 
                    // Check if we have legacy rules in LocalStorage
                    const localString = localStorage.getItem('validationRules');
                    let localRules: ValidationRule[] = [];

                    if (localString) {
                        try {
                            const parsed = JSON.parse(localString);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                localRules = parsed;
                            }
                        } catch (e) {
                            console.error('Error parsing local rules', e);
                        }
                    }

                    // Policy: If DB is empty and we have local rules, migrate them automatically
                    if (Array.isArray(dbRules) && dbRules.length === 0 && localRules.length > 0) {
                        console.log('Migrating rules from LocalStorage to Database...');
                        await saveRules(localRules);
                        // setRules is called inside saveRules
                    } else if (Array.isArray(dbRules) && dbRules.length > 0) {
                        setRules(dbRules);
                    } else if (localRules.length > 0) {
                        // Fallback: If DB fetch ok but empty, and we wasn't able to save for some reason, show local?
                        // Ideally we already called saveRules above.
                        // This block handles explicit "use local if DB empty" display logic if save failed?
                        // Let's just trust state.
                        setRules(localRules);
                    } else {
                        // Both empty
                        setRules([]);
                    }
                }
            } catch (error) {
                console.error('Failed to load rules:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        fetchRules();
    }, []);

    return { rules, saveRules, isLoaded };
}
