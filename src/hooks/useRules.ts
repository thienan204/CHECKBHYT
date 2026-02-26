import { useState, useEffect } from 'react';
import { ValidationRule, DEFAULT_RULES } from '@/lib/validation';
import { getBasePath } from '@/utils/config';

const STORAGE_KEY = 'validationRules';

export function useRules() {
    const [rules, setRules] = useState<ValidationRule[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const saveRules = async (newRules: ValidationRule[]) => {
        // Optimistic update
        setRules(newRules);
        try {
            const res = await fetch(`${getBasePath()}/api/rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRules)
            });
            if (!res.ok) {
                const errorData = await res.json(); // contains { error, details }
                const msg = errorData.details || errorData.error || 'Failed to save rules';
                throw new Error(msg);
            }
        } catch (error) {
            console.error('Failed to save rules:', error);
            throw error; // Propagate error to UI
        }
    };

    const fetchRules = async () => {
        try {
            const res = await fetch(`${getBasePath()}/api/rules`, { cache: 'no-store' });
            if (res.ok) {
                const dbRules = await res.json();

                console.log('useRules: Fetched DB Rules', dbRules.length, 'Active IDs:', dbRules.filter((r: any) => r.active).map((r: any) => r.id).join(', '));

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
                    return localRules;
                } else if (Array.isArray(dbRules) && dbRules.length > 0) {
                    setRules(dbRules);
                    return dbRules;
                } else if (localRules.length > 0) {
                    setRules(localRules);
                    return localRules;
                } else {
                    // Both empty, load defaults
                    console.log('No rules found in DB/Local, loading defaults...');
                    await saveRules(DEFAULT_RULES);
                    return DEFAULT_RULES;
                }
            }
        } catch (error) {
            console.error('Failed to load rules:', error);
            return [];
        } finally {
            setIsLoaded(true);
        }
        return [];
    };

    // Load from API on mount
    useEffect(() => {
        fetchRules();
    }, []);

    return { rules, saveRules, isLoaded, reloadRules: fetchRules };
}
